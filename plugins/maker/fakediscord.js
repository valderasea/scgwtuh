import axios from 'axios'
import { uploaderUguu } from "../../lib/uploader.js"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [name, ...quotedText] = text.split('|')
    quotedText = quotedText.join('|')
    
    if (!name || !quotedText) return m.reply(`*Format salah!*\n\nGunakan:\n_${usedPrefix + command} replyfoto/urlfoto nama|teks_`)

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

        const apiUrl = `https://zelapioffciall.koyeb.app/canvas/fakediscord?name=${encodeURIComponent(name)}&text=${encodeURIComponent(quotedText)}&url=${encodeURIComponent(url)}`
        
        await conn.sendMessage(m.chat, { 
            image: { url: apiUrl }, 
            caption: `*DISCORD FAKE CHAT*` 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
    } catch (e) {
        console.error(e)
        await m.reply("❌ Gagal membuat fakediscord.")
    }
}

handler.help = ["fakediscord <nama|teks>"]
handler.tags = ["maker"]
handler.command = /^(fakediscord|discord)$/i

export default handler