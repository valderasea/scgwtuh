import axios from 'axios'

async function getBuffer(url) {
  const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 25000 })
  return Buffer.from(r.data)
}

function safeName(s) {
  return String(s || 'tiktok')
    .replace(/[\\/:*?"<>|]/g, '')
    .slice(0, 80)
    .trim() || 'tiktok'
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`Gunakan format: ${usedPrefix}${command} <url tiktok>`)

  try {
    const inputUrl = args[0].trim()
    m.reply('Sedang diproses...')

    const apiUrl = `https://api.apocalypse.web.id/download/tiktok?url=${encodeURIComponent(inputUrl)}`
    const { data: res } = await axios.get(apiUrl, { timeout: 25000 })

    if (!res?.status) return m.reply('Gagal mengambil data dari API.')

    const result = res.result || {}
    const medias = Array.isArray(result.medias) ? result.medias : []

    const caption =
      `*TIKTOK DOWNLOADER*\n\n` +
      `📝 *Title:* ${result.title || '-'}\n` +
      `👤 *Author:* ${result.author || '-'} (@${result.unique_id || '-'})\n` +
      `📦 *Type:* ${result.type || '-'}\n`

    const images = medias.filter(v => v?.type === 'image' && v?.url && /^https?:\/\//.test(v.url))
    const video = medias.find(v => v?.type === 'video' && v?.url && /^https?:\/\//.test(v.url))
    const audio = medias.find(v => v?.type === 'audio' && v?.url && /^https?:\/\//.test(v.url))

    if (!images.length && !video && !audio) return m.reply('Media kosong. API ngasih data aneh.')

    if (images.length) {
      const chunkSize = 10
      for (let i = 0; i < images.length; i += chunkSize) {
        const chunk = images.slice(i, i + chunkSize)

        try {
          const albumItems = []
          for (let j = 0; j < chunk.length; j++) {
            const buf = await getBuffer(chunk[j].url)
            albumItems.push({
              image: buf,
              caption: (i === 0 && j === 0) ? caption : ''
            })
          }

          await conn.sendMessage(m.chat, { albumMessage: albumItems }, { quoted: m })
        } catch (e) {
          for (let j = 0; j < chunk.length; j++) {
            await conn.sendMessage(m.chat, {
              image: { url: chunk[j].url },
              caption: (i === 0 && j === 0) ? caption : ''
            }, { quoted: m })
          }
        }
      }
    }

    if (video) {
      await conn.sendMessage(m.chat, {
        video: { url: video.url },
        caption: images.length ? '' : caption
      }, { quoted: m })
    }

    if (audio) {
      await conn.sendMessage(m.chat, {
        audio: { url: audio.url },
        mimetype: 'audio/mpeg',
        fileName: `${safeName(result.author)}.mp3`
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    m.reply(`Error: ${e.message}`)
  }
}

handler.help = ['tiktok <url>']
handler.tags = ['downloader']
handler.command = /^(tt|tiktok|ttdl)$/i

export default handler