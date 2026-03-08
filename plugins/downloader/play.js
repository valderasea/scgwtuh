import yts from "yt-search"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import { request } from "undici"

const EXPIRE_MS = 5 * 60 * 1000

async function fetchBuf(url) {
  const res = await request(url)
  if (res.statusCode !== 200) throw new Error(`thumb fetch fail: ${res.statusCode}`)
  return Buffer.from(await res.body.arrayBuffer())
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function truncate(str = "", n = 45) {
  return str.length > n ? str.slice(0, n - 3) + "..." : str
}

async function renderPreview(query, results) {
  const W = 1100, H = 620
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext("2d")

  // bg
  ctx.fillStyle = "#0b0f14"
  ctx.fillRect(0, 0, W, H)

  // header title
  ctx.fillStyle = "rgba(255,255,255,0.95)"
  ctx.font = "700 36px sans-serif"
  ctx.fillText("YouTube Search", 42, 36)

  // search bar
  ctx.fillStyle = "rgba(255,255,255,0.06)"
  roundRect(ctx, 42, 90, 720, 50, 16); ctx.fill()
  ctx.strokeStyle = "rgba(255,255,255,0.12)"
  ctx.lineWidth = 1
  roundRect(ctx, 42, 90, 720, 50, 16); ctx.stroke()

  ctx.fillStyle = "rgba(255,255,255,0.75)"
  ctx.font = "18px sans-serif"
  ctx.fillText(query, 62, 122)

  // badges
  ctx.fillStyle = "rgba(255,255,255,0.5)"
  ctx.font = "13px sans-serif"
  ctx.fillText(`${results.length} results`, 820, 115)

  // grid
  const pad = 42, top = 170, gap = 20, cols = 3
  const cardW = (W - pad * 2 - gap * (cols - 1)) / cols
  const cardH = 200
  const thumbH = 120

  const items = results.slice(0, 6)
  const thumbs = await Promise.all(items.map(async (v) => {
    try {
      const buf = await fetchBuf(v.thumbnail)
      return await loadImage(buf)
    } catch { return null }
  }))

  for (let i = 0; i < items.length; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    const x = pad + c * (cardW + gap)
    const y = top + r * (cardH + gap)

    // card
    ctx.fillStyle = "rgba(255,255,255,0.04)"
    roundRect(ctx, x, y, cardW, cardH, 18); ctx.fill()
    ctx.strokeStyle = "rgba(255,255,255,0.10)"
    roundRect(ctx, x, y, cardW, cardH, 18); ctx.stroke()

    // thumb
    const tx = x + 12, ty = y + 12, tw = cardW - 24, th = thumbH
    ctx.fillStyle = "rgba(255,255,255,0.06)"
    roundRect(ctx, tx, ty, tw, th, 12); ctx.fill()

    const img = thumbs[i]
    if (img) {
      ctx.save()
      roundRect(ctx, tx, ty, tw, th, 12)
      ctx.clip()
      const scale = Math.max(tw / img.width, th / img.height)
      const iw = img.width * scale
      const ih = img.height * scale
      ctx.drawImage(img, tx + (tw - iw) / 2, ty + (th - ih) / 2, iw, ih)
      ctx.restore()
    }

    // duration pill
    if (items[i].timestamp) {
      const dur = items[i].timestamp
      ctx.font = "12px sans-serif"
      const w = ctx.measureText(dur).width + 16
      const h = 22
      const px = tx + tw - w - 10
      const py = ty + th - h - 10
      ctx.fillStyle = "rgba(0,0,0,0.55)"
      roundRect(ctx, px, py, w, h, 10); ctx.fill()
      ctx.fillStyle = "rgba(255,255,255,0.9)"
      ctx.fillText(dur, px + 8, py + 15)
    }

    // text
    ctx.fillStyle = "rgba(255,255,255,0.92)"
    ctx.font = "700 14px sans-serif"
    ctx.fillText(truncate(items[i].title, 44), tx, ty + th + 18)

    ctx.fillStyle = "rgba(255,255,255,0.55)"
    ctx.font = "12px sans-serif"
    ctx.fillText(truncate(items[i].author, 46), tx, ty + th + 40)
  }

  // footer
  ctx.fillStyle = "rgba(255,255,255,0.35)"
  ctx.font = "12px sans-serif"
  ctx.fillText(`Generated • ${new Date().toLocaleString()}`, 42, H - 24)

  return canvas.toBuffer("image/png")
}

function nowExpired(obj) {
  return !obj?.at || (Date.now() - obj.at) > EXPIRE_MS
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = (global.db.data.users[m.sender] ||= {})
  user.yt ||= user.yt || {}

  if (/^play$/i.test(command)) {
    if (!text) return m.reply(`Format salah.\nPakai: ${usedPrefix}${command} <query>`)

    if (m.react) await m.react("⏳")

    const q = text.trim()
    const res = await yts(q)
    const vids = (res.videos || []).slice(0, 20).map(v => ({
      title: v.title,
      url: v.url,
      thumbnail: v.thumbnail,
      timestamp: v.timestamp,
      author: v.author?.name || "-"
    }))

    if (!vids.length) {
      if (m.react) await m.react("❌")
      return m.reply("Ga nemu apa-apa. Query kamu mungkin ngaco.")
    }

    user.yt.last = { at: Date.now(), query: q, results: vids }
    user.yt.pick = null


    try {
      const img = await renderPreview(q, vids)
      await conn.sendMessage(m.chat, {
        image: img,
        caption: `🔍 *YOUTUBE SEARCH*\n\nQuery: *${q}*\nHasil: *${vids.length}*\n\nPilih dari list yang dikirim abis ini.`
      }, { quoted: m })
    } catch {
      await m.reply(`🔍 *YOUTUBE SEARCH*\n\nQuery: *${q}*\nHasil: *${vids.length}*\n\n(Preview gambar gagal, tapi list jalan.)`)
    }

    const sections = vids.slice(0, 15).map((v, i) => ({
      title: `HASIL KE-${i + 1}`,
      rows: [{
        header: v.author,
        title: truncate(v.title, 55),
        description: `Durasi: ${v.timestamp || "-"} `,
        id: `${usedPrefix}ytpick ${i}`
      }]
    }))

    const msg = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: `Pilih video di bawah:` },
            footer: { text: "ValL Assistant • YouTube" },
            header: { hasMediaAttachment: false },
            nativeFlowMessage: {
              buttons: [{
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "Pilih Video 🎬",
                  sections
                })
              }]
            }
          }
        }
      }
    }

    await conn.relayMessage(m.chat, msg, {})
    if (m.react) await m.react("✅")
    return
  }

  if (/^ytpick$/i.test(command)) {
    const st = user.yt.last
    if (!st || nowExpired(st)) return m.reply("List udah basi. Search ulang.")
    const idx = parseInt((text || "").trim())
    if (Number.isNaN(idx) || !st.results[idx]) return m.reply("Pilihan ngaco. Pilih dari list yang bener.")

    const v = st.results[idx]
    user.yt.pick = { at: Date.now(), video: v }

    const msg = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text:
                `Dipilih:\n*${v.title}*\n` +
                `${v.url}\n\n` +
                `Mau yang mana?`
            },
            footer: { text: "ValL Assistant • YouTube" },
            header: { hasMediaAttachment: false },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "MP3 🎵",
                    id: `${usedPrefix}ytmp3 ${v.url}`
                  })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "MP4 🎬",
                    id: `${usedPrefix}ytmp4 ${v.url}`
                  })
                }
              ]
            }
          }
        }
      }
    }

    return conn.relayMessage(m.chat, msg, {})
  }

  if (/^ytdl$/i.test(command)) {
    const pick = user.yt.pick
    if (!pick || nowExpired(pick)) return m.reply("Pilihan udah kadaluarsa. Pilih video lagi.")
    const mode = (text || "").trim().toLowerCase()
    if (mode !== "mp3" && mode !== "mp4") return m.reply("Pilih MP3 atau MP4. Jangan kreatif.")

    const v = pick.video

    return m.reply(
      `Oke.\n` +
      `Mode: *${mode.toUpperCase()}*\n` +
      `Target: ${v.url}\n\n` +
      `(Downloader belum tersambung.)`
    )
  }
}

handler.help = ["play <query>"]
handler.tags = ["downloader"]
handler.command = /^(play|ytpick|ytdl)$/i

export default handler