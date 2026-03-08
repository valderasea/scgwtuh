import cron from "node-cron"
import axios from "axios"

const TIMEZONE = "Asia/Jakarta"
const BASE = "https://api.myquran.com/v2/sholat"

// audio mp3 (ganti kalau mau)
const AUDIO_ADZAN = {
  subuh: "https://www.islamcan.com/audio/adhan/azan1.mp3",
  dzuhur: "https://www.islamcan.com/audio/adhan/azan1.mp3",
  ashar: "https://www.islamcan.com/audio/adhan/azan1.mp3",
  maghrib: "https://www.islamcan.com/audio/adhan/azan1.mp3",
  isya: "https://www.islamcan.com/audio/adhan/azan1.mp3",
}

const WAKTU_INFO = {
  subuh: { label: "Subuh", emoji: "🌙" },
  dzuhur: { label: "Dzuhur", emoji: "☀️" },
  ashar: { label: "Ashar", emoji: "🌤️" },
  maghrib: { label: "Maghrib", emoji: "🌇" },
  isya: { label: "Isya", emoji: "🌃" },
}

const jadwalCache = new Map() // key: `${kotaId}_${yyyy-mm-dd}`
const audioCache = new Map() // key: waktu

function nowJakarta() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }))
}

function datePartsJakarta() {
  const now = nowJakarta()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return { y, m, d, iso: `${y}-${m}-${d}` }
}

async function httpGet(url, timeout = 15000) {
  return axios.get(url, {
    timeout,
    headers: { "User-Agent": "Mozilla/5.0" },
    validateStatus: () => true,
  })
}

async function retryOnce(fn) {
  try {
    return await fn()
  } catch (e) {
    const msg = String(e?.message || e)
    if (/ETIMEDOUT|timeout|ECONNRESET|EAI_AGAIN/i.test(msg)) {
      return await fn()
    }
    throw e
  }
}

/* =========================
   API v2: kota cari
   ========================= */
async function getCity(kotaName) {
  const url = `${BASE}/kota/cari/${encodeURIComponent(kotaName)}`
  const res = await retryOnce(() => httpGet(url, 15000))
  const list = res?.data?.data
  if (res.status !== 200 || !Array.isArray(list) || !list.length) {
    throw new Error(`Kota "${kotaName}" gak ketemu.`)
  }
  return { id: String(list[0].id), nama: String(list[0].lokasi || kotaName) }
}

/* =========================
   API v2: jadwal harian
   ========================= */
async function getJadwalV2(kotaId) {
  const { y, m, d, iso } = datePartsJakarta()
  const key = `${kotaId}_${iso}`

  const cached = jadwalCache.get(key)
  if (cached && Date.now() - cached.at < 6 * 60 * 60 * 1000) return cached.data

  const url = `${BASE}/jadwal/${kotaId}/${y}/${m}/${d}`
  const res = await retryOnce(() => httpGet(url, 20000))

  const ok = res.status === 200 && res.data?.status
  const jadwal = ok ? res.data?.data?.jadwal : null
  if (!jadwal) throw new Error("Gagal ambil jadwal (v2).")

  const data = {
    subuh: jadwal.subuh || "-",
    dzuhur: jadwal.dzuhur || "-",
    ashar: jadwal.ashar || "-",
    maghrib: jadwal.maghrib || "-",
    isya: jadwal.isya || "-",
  }

  jadwalCache.set(key, { at: Date.now(), data })
  return data
}

/* =========================
   audio cache
   ========================= */
async function getAudioBuf(waktu) {
  const url = AUDIO_ADZAN[waktu]
  if (!url) return null

  const cached = audioCache.get(waktu)
  if (cached && Date.now() - cached.at < 24 * 60 * 60 * 1000) return cached.buf

  const res = await retryOnce(() =>
    axios.get(url, {
      responseType: "arraybuffer",
      timeout: 20000,
      headers: { "User-Agent": "Mozilla/5.0" },
      validateStatus: () => true,
    })
  )

  if (res.status !== 200) return null
  const buf = Buffer.from(res.data)
  audioCache.set(waktu, { at: Date.now(), buf })
  return buf
}

function buildText(waktu, jam, kotaNama) {
  const info = WAKTU_INFO[waktu] || { label: waktu, emoji: "🕌" }
  const doa =
    waktu === "subuh"
      ? "_Allahu Akbar..._\n_Hayya 'alash shalah..._\n_Ash-shalatu khairum minan-nawm..._"
      : "_Allahu Akbar..._\n_Hayya 'alash shalah..._\n_Hayya 'alal falah..._"

  return (
    `${info.emoji} *Waktu ${info.label} telah tiba*\n\n` +
    `🕌 Kota : *${kotaNama}*\n` +
    `🕐 Jam  : *${jam} WIB*\n\n` +
    `${doa}\n\n` +
    `_Gas sholat. Jangan debat._`
  )
}

async function kirimAdzan(conn, jid, waktu, jam, kotaNama) {
  await conn.sendMessage(jid, { text: buildText(waktu, jam, kotaNama) }).catch(() => {})
  const buf = await getAudioBuf(waktu).catch(() => null)
  if (buf) {
    await conn.sendMessage(jid, {
      audio: buf,
      mimetype: "audio/mpeg",
      ptt: false,
    }).catch(() => {})
  }
}

/* =========================
   scheduler per-grup
   ========================= */
function stopGroupTasks(jid) {
  global.__adzanTasks ||= {}
  const tasks = global.__adzanTasks[jid] || []
  for (const t of tasks) {
    try { t.stop() } catch {}
  }
  global.__adzanTasks[jid] = []
}

function setGroupTasks(jid, jadwal, kotaNama) {
  global.__adzanTasks ||= {}
  stopGroupTasks(jid)

  const make = (waktu, time) => {
    if (!time || time === "-") return
    const [h, m] = String(time).split(":").map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) return

    const task = cron.schedule(
      `${m} ${h} * * *`,
      async () => {
        const c = global.__conn
        if (!c) return
        await kirimAdzan(c, jid, waktu, time, kotaNama)
      },
      { scheduled: true, timezone: TIMEZONE }
    )

    global.__adzanTasks[jid].push(task)
  }

  make("subuh", jadwal.subuh)
  make("dzuhur", jadwal.dzuhur)
  make("ashar", jadwal.ashar)
  make("maghrib", jadwal.maghrib)
  make("isya", jadwal.isya)
}

async function refreshGroup(jid, chat) {
  if (!chat?.adzan?.enabled) return
  if (!chat?.adzan?.kotaId) return
  const jadwal = await getJadwalV2(chat.adzan.kotaId)
  setGroupTasks(jid, jadwal, chat.adzan.kotaNama || "Unknown")
}

/* =========================
   COMMAND
   ========================= */
let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply("Fitur grup doang. Jangan sok asik di private.")

  global.__conn = conn
  global.db.data.chats ||= {}
  const chat = (global.db.data.chats[m.chat] ||= {})
  chat.adzan ||= { enabled: false, kotaId: null, kotaNama: null }

  const sub = (args[0] || "").toLowerCase()
  const rest = args.slice(1).join(" ").trim()

  const needAdmin = ["on", "off", "kota", "test"]
  if (needAdmin.includes(sub) && !(isAdmin || isOwner)) {
    return m.reply("Admin aja. Lu siapa?")
  }

  if (sub === "on") {
    if (!rest) return m.reply(`Pakai:\n${usedPrefix + command} on <kota>\nContoh: ${usedPrefix + command} on Jakarta`)
    try {
      const { id, nama } = await getCity(rest)
      chat.adzan.enabled = true
      chat.adzan.kotaId = id
      chat.adzan.kotaNama = nama

      await refreshGroup(m.chat, chat)
      const jadwal = await getJadwalV2(id)

      return m.reply(
        `✅ *Adzan aktif!*\n\n` +
        `🕌 Kota: *${nama}* (${id})\n\n` +
        `Hari ini:\n` +
        `🌙 Subuh   : *${jadwal.subuh}*\n` +
        `☀️ Dzuhur  : *${jadwal.dzuhur}*\n` +
        `🌤️ Ashar   : *${jadwal.ashar}*\n` +
        `🌇 Maghrib : *${jadwal.maghrib}*\n` +
        `🌃 Isya    : *${jadwal.isya}*\n\n` +
        `_Bot bakal notif + audio otomatis._`
      )
    } catch (e) {
      return m.reply(`❌ ${e?.message || e}`)
    }
  }

  if (sub === "off") {
    chat.adzan.enabled = false
    stopGroupTasks(m.chat)
    return m.reply("🔕 Adzan dimatiin buat grup ini.")
  }

  if (sub === "kota") {
    if (!rest) return m.reply(`Pakai:\n${usedPrefix + command} kota <nama kota>`)
    try {
      const { id, nama } = await getCity(rest)
      chat.adzan.kotaId = id
      chat.adzan.kotaNama = nama
      if (chat.adzan.enabled) await refreshGroup(m.chat, chat)
      return m.reply(`✅ Kota diubah ke *${nama}* (${id}).`)
    } catch (e) {
      return m.reply(`❌ ${e?.message || e}`)
    }
  }

  if (sub === "test") {
    const w = (rest || "").toLowerCase()
    if (!WAKTU_INFO[w]) return m.reply("Waktu invalid. Pilih: subuh/dzuhur/ashar/maghrib/isya")

    const kotaNama = chat.adzan.kotaNama || "Jakarta"
    const now = nowJakarta()
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

    await m.reply(`🔔 Test adzan *${w}*...`)
    await kirimAdzan(conn, m.chat, w, hhmm, kotaNama)
    return
  }

  const enabled = chat.adzan.enabled
  const kotaNama = chat.adzan.kotaNama
  const kotaId = chat.adzan.kotaId

  let txt =
    `🕌 *Status Adzan Grup*\n\n` +
    `Status: ${enabled ? "✅ Aktif" : "🔕 Nonaktif"}\n` +
    `Kota  : ${kotaNama || "-"} ${kotaId ? `(${kotaId})` : ""}\n\n`

  if (enabled && kotaId) {
    try {
      const jadwal = await getJadwalV2(kotaId)
      txt +=
        `Jadwal hari ini:\n` +
        `🌙 Subuh   : *${jadwal.subuh}*\n` +
        `☀️ Dzuhur  : *${jadwal.dzuhur}*\n` +
        `🌤️ Ashar   : *${jadwal.ashar}*\n` +
        `🌇 Maghrib : *${jadwal.maghrib}*\n` +
        `🌃 Isya    : *${jadwal.isya}*\n\n`
    } catch {
      txt += `_(Gagal ambil jadwal hari ini)_\n\n`
    }
  }

  txt +=
    `Cmd:\n` +
    `• ${usedPrefix + command} on <kota>\n` +
    `• ${usedPrefix + command} off\n` +
    `• ${usedPrefix + command} kota <kota>\n` +
    `• ${usedPrefix + command} test <waktu>\n`

  return m.reply(txt)
}

handler.help = ["adzan"]
handler.tags = ["group"]
handler.command = /^adzan$/i
handler.group = true

/* =========================
   INIT: pasang ulang task
   ========================= */
handler.before = async function (m, { conn }) {
  global.__conn = conn
  if (global.__adzanInit) return
  global.__adzanInit = true

  global.db.data.chats ||= {}
  const chats = global.db.data.chats

  for (const jid of Object.keys(chats)) {
    const chat = chats[jid]
    if (chat?.adzan?.enabled && chat?.adzan?.kotaId) {
      await refreshGroup(jid, chat).catch(() => {})
    }
  }

  if (!global.__adzanRefreshTask) {
    global.__adzanRefreshTask = cron.schedule(
      "5 0 * * *",
      async () => {
        try {
          const c = global.__conn
          if (!c) return
          global.db.data.chats ||= {}
          const chats2 = global.db.data.chats

          for (const jid of Object.keys(chats2)) {
            const chat = chats2[jid]
            if (chat?.adzan?.enabled && chat?.adzan?.kotaId) {
              await refreshGroup(jid, chat).catch(() => {})
              await new Promise((r) => setTimeout(r, 400))
            }
          }
        } catch {}
      },
      { scheduled: true, timezone: TIMEZONE }
    )
  }
}

export default handler