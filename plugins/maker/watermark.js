import sticker from '../../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''

        if (!/webp/.test(mime)) return m.reply(`Reply stiker yang mau dikasih watermark mbut!`)

        if (m.react) await m.react("⏳")

        let [packname, author] = text.split('|').map(v => v.trim())
        let metadata = {
            packName: packname || global.packname || 'ValL-Assistant',
            packPublish: author || global.author || 'ValL'
        }

        let stiker = await sticker.writeExif({
            data: await q.download(),
            mimetype: mime
        }, metadata)

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            if (m.react) await m.react("✅")
        }

    } catch (e) {
        console.error(e)
        if (m.react) await m.react("❌")
        m.reply("Gagal ganti watermark mbut.")
    }
}

handler.help = ['wm']
handler.tags = ['sticker']
handler.command = /^(wm|watermark)$/i

export default handler