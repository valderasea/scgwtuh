import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*\n\nGunakan link spotify hasil search tadi cik.`)

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    try {
        
        const { data: res } = await axios.get(`https://api.nexray.web.id/downloader/spotify?url=${encodeURIComponent(text)}`)

        if (res && res.status && res.result) {
            const result = res.result
            const dlink = result.url
            
            let txt = `*SPOTIFY DOWNLOADER*\n\n`
            txt += `◦  *Judul:* ${result.title}\n`
            txt += `◦  *Artis:* ${result.artist}\n\n`
            txt += `_Sedang mengirim audio, tunggu bentar cik..._`

            await conn.sendMessage(m.chat, { 
                audio: { url: dlink }, 
                mimetype: 'audio/mpeg',
                fileName: `${result.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: result.title,
                        body: result.artist,
                        thumbnailUrl: "https://files.catbox.moe/8be9v0.jpg",
                        sourceUrl: text,
                        mediaType: 1,
                        showAdAttribution: true,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m })

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
        } else {
            await m.reply("❌ Gagal mengambil data download. API mungkin lagi limit.")
        }
    } catch (e) {
        console.error(e)
        await m.reply("❌ Server NexRay lagi dongo cik, coba lagi nanti.")
    }
}

handler.command = /^(spotifydl)$/i

export default handler