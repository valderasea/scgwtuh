import axios from 'axios'
import { uploaderUguu } from "../../lib/uploader.js"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*\n\nGunakan:\n_${usedPrefix + command} <nama>_\n\nContoh: _${usedPrefix + command} Hazel fotonya_`)

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        let url

        if (mime.startsWith('image/')) {
            let media = await q.download()
            url = await uploaderUguu(media)
        } else {
            url = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.catbox.moe/8be9v0.jpg')
        }

        const apiUrl = `https://zelapioffciall.koyeb.app/canvas/mlbb?name=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        
        await conn.sendMessage(m.chat, { 
            image: { url: apiUrl }, 
            caption: `*MLBB LOADING SCREEN*` 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
    } catch (e) {
        console.error(e)
        await m.reply("❌ Gagal membuat loading screen MLBB.")
    }
}

handler.help = ["mlbb <nama> <replyfoto/urlfoto>"]
handler.tags = ["maker"]
handler.command = /^(mlbb)$/i

export default handler