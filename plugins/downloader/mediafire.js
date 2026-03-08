import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan URL MediaFire!\n\nContoh: *${usedPrefix + command}* https://www.mediafire.com/file/xxxx`)
    
    if (m.react) await m.react('⏳')

    try {
        const url = `https://api.deline.web.id/downloader/mediafire?url=${encodeURIComponent(text.trim())}`
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

        const { fileName, downloadUrl } = res.result

        if (!downloadUrl) {
            if (m.react) await m.react('❌')
            return m.reply('❌ Link download tidak ditemukan.')
        }

        await conn.sendMessage(m.chat, { 
            document: { url: downloadUrl }, 
            fileName: fileName || 'Mediafire_File',
            mimetype: 'application/zip',
            caption: `✅ *MEDIAFIRE SUCCESS*\n\n📁 *File:* ${fileName}`
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Error: ${e.message}`)
    }
}

handler.help = ['mediafire']
handler.tags = ['downloader']
handler.command = /^(mediafire|mf)$/i 

export default handler