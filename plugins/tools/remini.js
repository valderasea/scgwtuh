import { uploaderUguu } from '../../lib/uploader.js'
import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!/image/.test(mime)) return m.reply(`Kirim atau reply foto yang mau di-HD in!`)

    if (m.react) await m.react('⏳')

    try {
        let img = await q.download()
        // Upload dulu ke Uguu biar dapet link
        let link = await uploaderUguu(img)
        
        // Tembak ke API HD Deline
        let api = `https://api.deline.web.id/tools/hd?url=${encodeURIComponent(link)}`
        
        const response = await axios.get(api, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)

        // Kirim hasilnya sebagai foto
        await conn.sendFile(m.chat, buffer, 'hd.jpg', 'Nih udah bening 🗿', m)
        
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        console.error(e)
        m.reply(`❌ Gagal bikin HD: ${e.message}`)
    }
}

handler.help = ['hd']
handler.tags = ['tools']
handler.command = /^(hd|remini|upscale)$/i

export default handler