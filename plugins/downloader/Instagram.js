import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan URL Instagram!\n\nContoh: *${usedPrefix + command}* https://www.instagram.com/p/xxxx`)
    
    if (m.react) await m.react('⏳')

    try {
        const url = `https://api.deline.web.id/downloader/ig?url=${encodeURIComponent(text.trim())}`
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            }
        })
        const res = await response.json()

        if (!res || res.status !== true || !res.result) {
            if (m.react) await m.react('❌')
            return m.reply('❌ Gagal mengambil data.')
        }

        const { images, videos } = res.result.media
        let media = [...images, ...videos]

        if (media.length === 0) {
            if (m.react) await m.react('❌')
            return m.reply('❌ Media tidak ditemukan.')
        }

        for (let item of media) {
            const isVideo = videos.includes(item)
            await conn.sendMessage(m.chat, { 
                [isVideo ? 'video' : 'image']: { url: item },
                caption: isVideo ? '' : undefined
            }, { quoted: m })
        }

        if (m.react) await m.react('✅')

    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Error: ${e.message}`)
    }
}

handler.help = ['igdl']
handler.tags = ['downloader']
handler.command = /^(ig|igdl|instagram)$/i 

export default handler