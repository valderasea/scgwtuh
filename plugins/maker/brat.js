import axios from 'axios'
import sticker from '../../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan teksnya mbut!\nContoh: *${usedPrefix + command}* tes brat`)

    if (m.react) await m.react('⏳')

    try {
        const url = `https://api.deline.web.id/maker/brat?text=${encodeURIComponent(text)}`
        const response = await axios.get(url, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)
        
        const stiker = await sticker.writeExif({ 
            data: buffer, 
            mimetype: 'image/png' 
        }, {
            packName: 'Brat',
            packPublish: 'ValL-Assistant'
        })

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
        }

        if (m.react) await m.react('✅')

    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['brat']
handler.tags = ['maker']
handler.command = /^(brat)$/i

export default handler