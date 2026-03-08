import { uploaderUguu } from '../../lib/uploader.js'
import axios from 'axios'

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!/image/.test(mime)) return m.reply(`Kirim atau reply foto!`)

    if (m.react) await m.react('⏳')

    try {
        let img = await q.download()
        let link = await uploaderUguu(img)
        let api = `https://api.deline.web.id/tools/removebg?url=${encodeURIComponent(link)}`
        
        const { data } = await axios.get(api)
        if (!data.status) throw new Error('API Error')

        let result = data.result.cutoutUrl

        await conn.sendFile(m.chat, result, 'nobg.png', 'Nih.', m)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = handler.command = ['removebg']
handler.tags = ['tools']

export default handler