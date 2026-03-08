const DAY = 24 * 60 * 60 * 1000

function msToDays(ms) {
  return Math.floor(ms / DAY)
}

function pickDays(arg, def = 7) {
  const n = parseInt(arg)
  if (Number.isNaN(n)) return def
  return Math.max(1, Math.min(n, 365))
}

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply("> Perintah ini hanya dapat digunakan di dalam grup.")
  if (!isAdmin && !isOwner) return m.reply("> Hanya admin yang bisa akses fitur ini.")

  const chat = (global.db.data.chats[m.chat] ||= {})
  chat.inactive ||= {
    enabled: false,
    days: 7,
    lastScan: [],
    lastScanAt: 0,
  }

  const sub = (args[0] || "").toLowerCase()

  // Bantuan
  if (!sub || sub === "help") {
    const st = chat.inactive
    return m.reply(
`> *INACTIVE MANAGER*

 • Status: ${st.enabled ? "✅ ON" : "❌ OFF"}
 • Batas: ${st.days} hari

*Cmd:*
 • ${usedPrefix + command} on <hari>
 • ${usedPrefix + command} off
 • ${usedPrefix + command} scan
 • ${usedPrefix + command} kick <nomor>

*Catatan:*
- Bot harus admin kalau mau kick.
- Member yang tidak pernah chat sejak fitur dipasang tidak akan terdeteksi.`
    )
  }

  if (sub === "on") {
    const days = pickDays(args[1], chat.inactive.days || 7)
    chat.inactive.enabled = true
    chat.inactive.days = days
    return m.reply(`> ✅ Inactive kick ON. Batas: ${days} hari.`)
  }

  if (sub === "off") {
    chat.inactive.enabled = false
    return m.reply("> ✅ Inactive kick OFF.")
  }

  const meta = await conn.groupMetadata(m.chat)
  const members = meta.participants || []
  const admins = new Set(members.filter(p => p.admin).map(p => p.id))
  const botJid = conn.user?.jid
  const ownerJid = meta.owner

  if (sub === "scan") {
    const st = chat.inactive
    if (!st.enabled) return m.reply("> Fitur masih OFF. Ketik `.inactive on` dulu.")

    const limitDays = st.days
    const now = Date.now()
    // Ambil data stats dari jalur yang bener
    const groupData = global.db.data.groups?.[m.chat]?.stats || {} 

    const res = []
    for (const p of members) {
      const jid = p.id
      if (jid === botJid || jid === ownerJid || admins.has(jid)) continue

      const u = groupData[jid.split("@")[0]]
      const last = u?.lastchat || 0 // Data dari handler.js
      if (!last) continue 

      const idleDays = msToDays(now - last)
      if (idleDays >= limitDays) {
        res.push({ jid, daysIdle: idleDays, lastchat: last, name: u.name })
      }
    }

    res.sort((a, b) => b.daysIdle - a.daysIdle)
    st.lastScan = res
    st.lastScanAt = now

    if (!res.length) return m.reply(`> Aman. Tidak ada member nganggur >= ${limitDays} hari.`)

    const list = res.slice(0, 20).map((x, i) => {
      return `> ${i + 1}. @${x.jid.split("@")[0]} (${x.daysIdle} hari)`
    }).join("\n")

    return conn.sendMessage(m.chat, {
      text: `> *HASIL SCAN INACTIVE*\n\n${list}\n\nTotal: ${res.length} member.\nKick: \`.inactive kick <no>\``,
      mentions: res.slice(0, 20).map(x => x.jid)
    }, { quoted: m })
  }

  if (sub === "kick") {
    const st = chat.inactive
    if (!st.enabled || !st.lastScan.length) return m.reply("> Scan dulu.")
    
    if (!admins.has(botJid)) return m.reply("> Bot harus jadi admin buat kick orang.")

    const idx = parseInt(args[1])
    const target = st.lastScan?.[idx - 1]
    if (!target) return m.reply("> Nomor urut salah.")

    await conn.groupParticipantsUpdate(m.chat, [target.jid], "remove")
    return m.reply(`> ✅ Kick @${target.jid.split("@")[0]} (Idle ${target.daysIdle} hari) berhasil.`)
  }
}

handler.help = ["inactive"]
handler.tags = ["group"]
handler.command = /^inactive$/i
handler.group = true
handler.admin = true

export default handler