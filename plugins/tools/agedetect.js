import axios from 'axios'
import { uploaderUguu } from "../../lib/uploader.js"

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) return m.reply(`*Format salah!*\n\nKirim atau balas foto dengan perintah: _${usedPrefix + command}_`)

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    try {
        let media = await q.download()
        let url = await uploaderUguu(media)
        
        const { data } = await axios.get(`https://zelapioffciall.koyeb.app/tools/agedetect?url=${encodeURIComponent(url)}`)

        if (data && data.status) {
            const result = data.result || data.message || data
            await m.reply(typeof result === 'object' ? JSON.stringify(result, null, 2) : result)
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
        } else {
            await m.reply("❌ API Error")
        }
    } catch (e) {
        console.error(e)
        await m.reply("❌ Gagal mendeteksi umur.")
    }
}

handler.help = ["agedetect <foto>"]
handler.tags = ["tools"]
handler.command = /^(agedetect)$/i

export default handler