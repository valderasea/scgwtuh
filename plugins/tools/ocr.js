import { uploaderUguu } from '../../lib/uploader.js'
import axios from 'axios'

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!/image/.test(mime)) return m.reply(`Kirim atau reply foto yang ada teksnya!`)

    if (m.react) await m.react('⏳')

    try {
        let img = await q.download()
        let link = await uploaderUguu(img)
        
        let api = `https://api.deline.web.id/tools/ocr?url=${encodeURIComponent(link)}`
        const { data } = await axios.get(api)

        if (!data.status) throw new Error('Gagal baca gambar')

        await m.reply(data.Text)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['ocr']
handler.tags = ['tools']
handler.command = /^(ocr|readtext)$/i

export default handler