import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*\n\nGunakan:\n_${usedPrefix + command} <url pastebin>_`)

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    try {
        const { data } = await axios.get(`https://zelapioffciall.koyeb.app/tools/pastebin?url=${encodeURIComponent(text)}`)

        if (data && data.status && data.content) {
            await m.reply(data.content)
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
        } else {
            await m.reply("❌ API Error")
        }
    } catch (e) {
        console.error(e)
        await m.reply("❌ Gagal mengambil konten pastebin.")
    }
}

handler.help = ["pastebin <url>"]
handler.tags = ["tools"]
handler.command = /^(pastebin)$/i

export default handler