import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*\n\nGunakan:\n_${usedPrefix + command} <teks>_`)

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    try {
        const { data } = await axios.get(`https://zelapioffciall.koyeb.app/ai/luminai?text=${encodeURIComponent(text)}`)

        if (data && data.status && data.result) {
            await m.reply(data.result)
        } else {
            await m.reply("❌ API Error")
        }
    } catch (e) {
        console.error(e)
        await m.reply("❌ Gagal memproses permintaan.")
    }
}

handler.help = ["luminai <teks>"]
handler.tags = ["ai"]
handler.command = /^(luminai)$/i

export default handler