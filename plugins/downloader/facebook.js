import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan URL Facebook!\n\nContoh: *${usedPrefix + command}* https://www.facebook.com/share/r/1H7DdZ17kW/`)
    
    if (m.react) await m.react('⏳')

    try {
        const url = `https://api.deline.web.id/downloader/facebook?url=${encodeURIComponent(text.trim())}`
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

        const videoUrl = res.result.download || res.result.list?.[0]?.url

        if (!videoUrl) {
            if (m.react) await m.react('❌')
            return m.reply('❌ Link video tidak ditemukan.')
        }

        await conn.sendMessage(m.chat, { 
            video: { url: videoUrl }, 
            caption: `✅ *FACEBOOK SUCCESS*`,
            mimetype: 'video/mp4'
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Error: ${e.message}`)
    }
}

handler.help = ['fb']
handler.tags = ['downloader']
handler.command = /^(fb|fbdl|facebook)$/i 

export default handler