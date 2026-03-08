import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan URL YouTube!\n\nContoh: *${usedPrefix + command}* https://youtu.be/KEVt5EoYjWs`)
    
    if (m.react) await m.react('⏳')

    try {
        const url = `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(text.trim())}`
        const response = await fetch(url)
        const res = await response.json()

        // Validasi status API
        if (!res || res.status !== true || !res.result) {
            if (m.react) await m.react('❌')
            return m.reply('❌ Gagal mengambil data video dari API.')
        }

        const videoUrl = res.result.download_url 

        if (!videoUrl) {
            if (m.react) await m.react('❌')
            return m.reply('❌ Link download tidak ditemukan dalam respon API.')
        }

        // Kirim video langsung
        await conn.sendMessage(m.chat, { 
            video: { url: videoUrl }, 
            caption: `✅ *YTMP4 BERHASIL*\n🔗 *Source:* ${text.trim()}`,
            mimetype: 'video/mp4'
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error("Error YTMP4:", e)
        if (m.react) await m.react('❌')
        m.reply(`❌ Terjadi kesalahan: ${e.message}`)
    }
}

handler.help = ['ytmp4']
handler.tags = ['downloader']
handler.command = /^(ytmp4|ytv)$/i 

export default handler