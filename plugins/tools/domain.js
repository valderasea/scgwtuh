import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*\n\nGunakan:\n_${usedPrefix + command} vercel.com_`)

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    try {
        const { data } = await axios.get(`https://zelapioffciall.koyeb.app/tools/domain?q=${encodeURIComponent(text)}`)

        if (data && data.status) {
            let txt = `*DOMAIN INFO*\n\n`
            txt += `◦  *Domain:* ${data.domain}\n`
            txt += `◦  *IP:* ${data.ip}\n`
            txt += `◦  *ISP:* ${data.isp}\n`
            txt += `◦  *Org:* ${data.org}\n`
            txt += `◦  *Country:* ${data.country}\n`
            txt += `◦  *Region:* ${data.region}\n`
            txt += `◦  *City:* ${data.city}\n`
            txt += `◦  *Timezone:* ${data.timezone.id} (${data.timezone.utc})\n`
            txt += `◦  *Type:* ${data.type}`

            await m.reply(txt)
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
        } else {
            await m.reply("❌ API Error")
        }
    } catch (e) {
        console.error(e)
        await m.reply("❌ Gagal melacak domain.")
    }
}

handler.help = ["domain <url>"]
handler.tags = ["tools"]
handler.command = /^(domain|whois)$/i

export default handler