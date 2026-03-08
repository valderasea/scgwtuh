import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`⊏|⊐ *Contoh:* ${usedPrefix + command} nahida`)

    if (m.react) await m.react('⏱️')

    try {
        const { data } = await axios.get(`https://api.nexray.web.id/search/pinterest?q=${encodeURIComponent(text)}`)

        if (!data.status || !data.result.length) return m.reply('Gak ada gambarnya cik.')

        let results = data.result.sort(() => 0.5 - Math.random()).slice(0, 5)
        let messages = []

        for (let item of results) {
            messages.push({
                image: { url: item.images_url },
                caption: `📌 *Title:* ${item.grid_title || 'No Title'}\n👤 *Author:* ${item.pinner.full_name}\n🔗 *Link:* ${item.pin}`,
                footer: 'Asikin aja.',
                headerType: 4,
                buttons: [
                    { buttonId: `${usedPrefix}pin ${text}`, buttonText: { displayText: 'Next Image' }, type: 1 }
                ]
            })
        }

        // Kirim sebagai album/carousel biar bisa digeser
        await conn.sendAlbumMessage(m.chat, messages, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        m.reply('Gagal nembak Pinterest NexRay.')
    }
}

handler.help = ['pinterest']
handler.tags = ['tools']
handler.command = /^(pinterest|pin)$/i

export default handler