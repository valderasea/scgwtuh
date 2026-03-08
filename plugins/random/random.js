import axios from 'axios'

let handler = async (m, { conn, command }) => {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    try {
        const { data } = await axios.get(`https://zelapioffciall.koyeb.app/random/${command}`)

        if (data && data.status) {
            const result = data.message || data.result || "❌ Data tidak ditemukan"
            await m.reply(typeof result === 'object' ? JSON.stringify(result, null, 2) : result)
        } else {
            await m.reply("❌ API Error")
        }
    } catch (e) {
        console.error(e)
        await m.reply("❌ Gagal mengambil data.")
    }
}

handler.help = ["fakedata", "janganlah", "quotes", "motivasi-islam", "kataislami", "motivasi", "proxy", "baskara"]
handler.tags = ["random"]
handler.command = /^(fakedata|janganlah|quotes|motivasi-islam|kataislami|motivasi|proxy|baskara)$/i

export default handler