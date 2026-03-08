import { uploaderUguu } from '../../lib/uploader.js'
import axios from 'axios'

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!/image/.test(mime)) return m.reply(`Kirim atau reply foto yang mau di-edit!`)

    if (m.react) await m.react('⏳')

    try {
        let img = await q.download()
        let link = await uploaderUguu(img)
        
        let api = `https://api.baguss.xyz/api/edits/tofigure?image=${encodeURIComponent(link)}`
        const { data } = await axios.get(api)

        if (!data.success) throw new Error('API lagi mogok!')

        await conn.sendFile(m.chat, data.result, 'figure.png', 'Nih jadi figure 🗿', m)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['tofigure']
handler.tags = ['maker']
handler.command = /^(tofigure|figure)$/i

export default handler