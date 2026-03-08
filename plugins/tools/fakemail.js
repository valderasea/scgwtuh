import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    try {
        if (command === 'fakemail') {
            const { data } = await axios.get('https://api.vreden.my.id/api/v1/tools/fakemail/create')
            if (data && data.status) {
                let res = data.result
                let id = res.id
                let email = res.addresses[0].address
                
                let txt = `*FAKEMAIL CREATED*\n\n`
                txt += `◦  *Email:* ${email}\n`
                txt += `◦  *ID:* ${id}\n`
                txt += `◦  *Expires:* ${res.expiresAt}\n\n`
                txt += `Klik tombol di bawah untuk menyalin ID, lalu gunakan perintah:\n*${usedPrefix}checkmail <id_tadi>*`

                let msg = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage: {
                                body: { text: txt },
                                footer: { text: "Click button to copy ID" },
                                header: { hasMediaAttachment: false },
                                nativeFlowMessage: {
                                    buttons: [
                                        {
                                            name: "cta_copy",
                                            buttonParamsJson: JSON.stringify({
                                                display_text: "Salin ID",
                                                copy_code: id
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
            } else {
                await m.reply("❌ Gagal membuat email.")
            }
        }

        if (command === 'checkmail') {
            if (!text) return m.reply(`*Format salah!*\n\nGunakan:\n_${usedPrefix + command} <id_fakemail>_`)
            
            const { data } = await axios.get(`https://api.vreden.my.id/api/v1/tools/fakemail/inbox?id=${text}`)
            
            if (data && data.status && Array.isArray(data.result) && data.result.length > 0) {
                let inbox = data.result
                let txt = `*INBOX FAKEMAIL*\n\n`
                for (let msg of inbox) {
                    txt += `◦  *From:* ${msg.from}\n`
                    txt += `◦  *Subject:* ${msg.subject}\n`
                    txt += `◦  *Body:* \n${msg.body}\n`
                    txt += `––––––––––––––––––\n\n`
                }
                await m.reply(txt)
                await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
            } else {
                await m.reply("✉️ Inbox masih kosong atau ID sudah tidak valid.")
            }
        }
    } catch (e) {
        console.error(e)
        await m.reply("❌ Server Vreden lagi dongo cik.")
    }
}

handler.help = ["fakemail", "checkmail <id>"]
handler.tags = ["tools"]
handler.command = /^(fakemail|checkmail)$/i

export default handler