import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan URL websitenya!\nContoh: ${usedPrefix + command} https://google.com`)

    if (m.react) await m.react('⏳')

    try {
        let api = `https://api.deline.web.id/tools/screenshot?url=${encodeURIComponent(text)}`
        const response = await axios.get(api, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)

        await conn.sendFile(m.chat, buffer, 'screenshot.jpg', `Nih hasil screenshot: ${text}`, m)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['ssweb']
handler.tags = ['tools']
handler.command = /^(ssweb|ss|screenshot)$/i

export default handler