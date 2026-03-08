import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan URL Google Drive!\n\nContoh: *${usedPrefix + command}* https://drive.google.com/file/d/xxxx`)
    
    if (m.react) await m.react('⏳')

    try {
        const url = `https://api.deline.web.id/downloader/gdrive?url=${encodeURIComponent(text.trim())}`
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

        const { downloadUrl, fileName, fileSize, mimetype } = res.result

        if (!downloadUrl) {
            if (m.react) await m.react('❌')
            return m.reply('❌ Link download tidak ditemukan.')
        }

        await conn.sendMessage(m.chat, { 
            document: { url: downloadUrl }, 
            fileName: fileName || 'Gdrive_File',
            mimetype: mimetype || 'application/octet-stream',
            caption: `✅ *GDRIVE SUCCESS*\n\n📁 *File:* ${fileName}\n⚖️ *Size:* ${fileSize}`
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Error: ${e.message}`)
    }
}

handler.help = ['gdrive']
handler.tags = ['downloader']
handler.command = /^(gdrive|drive)$/i 

export default handler