import { uploaderUguu } from '../../lib/uploader.js'

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime) return m.reply('Reply medianya dulu!')

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    try {
        let media = await q.download()
        let link = await uploaderUguu(media) 
        
        let txt = `✅ *SUCCESS UPLOAD*\n\n🔗 *Link:* ${link}`

        let msg = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: txt },
                        footer: { text: "ValL Assistant" },
                        header: {
                            title: "Uguu Uploader",
                            hasMediaAttachment: false
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_copy",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "Salin Link 📋",
                                        copy_code: link
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        }

       
        await conn.relayMessage(m.chat, msg, { messageId: m.key.id })
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

    } catch (e) {
        console.error(e)
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = /^(tourl|uguu)$/i

export default handler