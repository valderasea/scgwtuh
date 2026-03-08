import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Mau nanya apa sama Lala?`)

    if (m.react) await m.react('⏳')

    try {
        let prompt = "Kamu adalah Lala. Asisten dari ValL , AI yang asik, friendly, kadang suka bercanda, tapi tetep membantu. Gunakan bahasa yang santai kayak lagi chat sama temen akrab."
        let api = `https://api.deline.web.id/ai/openai?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(prompt)}`
        
        const { data } = await axios.get(api)

        if (!data.status) throw new Error('Lala lagi pusing, eh sori, maksudnya lagi error!')

        await m.reply(data.result)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['Lala']
handler.tags = ['ai']
handler.command = /^(lala)$/i

export default handler