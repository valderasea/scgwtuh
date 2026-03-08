let handler = async (m, { conn, usedPrefix }) => {
    if (!m.isGroup) return m.reply("Perintah ini cuma bisa di grup cik!")
    
    let group = m.chat
    let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)

    let txt = `*LINK GROUP*\n\n`
    txt += `🔗 *Link:* ${link}\n\n`
    txt += `Klik tombol di bawah buat salin link grupnya.`

    try {
        let msg = {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: { text: txt },
                        footer: { text: "ValL Assistant • Group Tools" },
                        header: { hasMediaAttachment: false },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_copy",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "Salin Link 📋",
                                        id: link,
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
    } catch (e) {
        console.error(e)
        m.reply(`Link Group: ${link}`)
    }
}

handler.help = ['linkgc']
handler.tags = ['group']
handler.command = /^(linkgc|linkgrup|link)$/i
handler.group = true
handler.botAdmin = true

export default handler