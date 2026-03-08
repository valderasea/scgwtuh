import { createCanvas, loadImage } from "@napi-rs/canvas"
import { request } from "undici"
import https from 'https'

class SpotifySearch {
  constructor() {
    this.baseUrl = 'https://api.spotify.com'
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://open.spotify.com/'
    }
  }

  request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let body = ''
        res.on('data', chunk => body += chunk)
        res.on('end', () => resolve({ statusCode: res.statusCode, body }))
      })
      req.on('error', reject)
      if (options.headers) {
        Object.entries(options.headers).forEach(([k, v]) => req.setHeader(k, v))
      }
      req.end()
    })
  }

  async getToken() {
    try {
      const response = await this.request('https://open.spotify.com/embed/track/3HHqVJHqwgkxWhOQ4MhLB6', {
        method: 'GET',
        headers: { ...this.headers, 'Accept': 'text/html' }
      })
      if (response.statusCode !== 200) return null
      const match = response.body.match(/"accessToken":"(BQ[^"]+)"/)
      return match ? match[1] : null
    } catch { return null }
  }

  async search(query, limit = 15) {
    const token = await this.getToken()
    if (!token) return { success: false }
    const payload = new URLSearchParams({ q: query, type: 'track', limit: limit.toString() })
    try {
      const response = await this.request(`${this.baseUrl}/v1/search?${payload}`, {
        method: 'GET',
        headers: { ...this.headers, 'Authorization': `Bearer ${token}` }
      })
      if (response.statusCode !== 200) return { success: false }
      const data = JSON.parse(response.body)
      return {
        success: true,
        results: data.tracks.items.map(track => ({
          title: track.name,
          artist: track.artists.map(a => a.name).join(', '),
          album: track.album.name,
          duration: `${Math.floor(track.duration_ms / 60000)}:${((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}`,
          image: track.album.images[0]?.url || '',
          url: `https://open.spotify.com/track/$${track.id}`
        }))
      }
    } catch { return { success: false } }
  }
}

async function fetchBuf(url) {
  const res = await request(url, { headers: { "user-agent": "Mozilla/5.0" } })
  return Buffer.from(await res.body.arrayBuffer())
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath(); ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath()
}

async function renderSpotifySearchCard(query, items) {
  const W = 1000, H = 360, pad = 34
  const canvas = createCanvas(W, H), ctx = canvas.getContext("2d")
  ctx.fillStyle = "#0b0f14"; ctx.fillRect(0, 0, W, H)

  const coverUrl = items[0]?.image
  if (coverUrl) {
    try {
      const img = await loadImage(await fetchBuf(coverUrl))
      ctx.save(); ctx.globalAlpha = 0.2
      ctx.drawImage(img, -100, -100, W + 200, H + 200)
      ctx.restore()
      
      ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, W, H)
      roundRect(ctx, pad + 26, pad + 26, 250, 250, 22)
      ctx.save(); ctx.clip(); ctx.drawImage(img, pad + 26, pad + 26, 250, 250); ctx.restore()
    } catch (e) {}
  }

  ctx.fillStyle = "white"; ctx.font = "700 30px sans-serif"
  ctx.fillText(query.slice(0, 25), 350, 100)
  ctx.fillStyle = "#1DB954"; ctx.font = "14px sans-serif"
  ctx.fillText("SPOTIFY SEARCH", 350, 60)

  items.slice(0, 4).forEach((it, i) => {
    ctx.fillStyle = "white"; ctx.font = "bold 14px sans-serif"
    ctx.fillText(`${i+1}. ${it.title.slice(0, 30)}`, 350, 150 + (i * 45))
    ctx.fillStyle = "gray"; ctx.font = "12px sans-serif"
    ctx.fillText(`${it.artist} • ${it.duration}`, 350, 168 + (i * 45))
  })

  return canvas.toBuffer("image/png")
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*Format salah!*\n\nGunakan:\n_${usedPrefix + command} monolog_`)
  m.react('⏳')

  try {
    const sp = new SpotifySearch()
    const { success, results } = await sp.search(text)

    if (!success || results.length === 0) {
      m.react('❌'); return m.reply("❌ Lagu gak ketemu.")
    }

    const img = await renderSpotifySearchCard(text, results)
    
    await conn.sendMessage(m.chat, {
      image: img,
      caption: `🔍 *SPOTIFY SEARCH*\n\nQuery: *${text}*\nPilih lagu di bawah ini bos.`
    }, { quoted: m })

    const sections = results.map((v, i) => ({
      title: `HASIL KE-${i + 1}`,
      rows: [{
        header: v.artist,
        title: v.title,
        description: `Album: ${v.album} | Durasi: ${v.duration}`,
        id: `${usedPrefix}spotifydl ${v.url}`
      }]
    }))

    await conn.relayMessage(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: `Silakan pilih lagu untuk download.` },
            footer: { text: "ValL Assistant • Spotify" },
            nativeFlowMessage: {
              buttons: [{
                name: "single_select",
                buttonParamsJson: JSON.stringify({ title: "Pilih Lagu 🎵", sections })
              }]
            }
          }
        }
      }
    }, {})
    
    m.react('✅')
  } catch (e) {
    console.error(e); m.react('❌')
  }
}

handler.help = ["spotify"]
handler.tags = ["downloader"]
handler.command = /^(spotify|spsearch)$/i
export default handler