import axios from 'axios'

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan kode JavaScript yang mau di-encrypt!\nContoh: ${usedPrefix + command} console.log('hello')`)

    if (m.react) await m.react('⏳')

    try {
        let api = `https://api.deline.web.id/tools/enc?text=${encodeURIComponent(text)}`
        const { data } = await axios.get(api)

        if (!data.status) throw new Error('API Error')

        await m.reply(data.result)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['enc']
handler.tags = ['tools']
handler.command = /^(enc|obfuscate)$/i

export default handler