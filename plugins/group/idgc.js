let handler = async (m, { conn, groupMetadata }) => {
    // Pastikan perintah dijalankan di dalam grup
    if (!m.isGroup) return m.reply("Perintah ini hanya dapat digunakan di dalam grup!")

    const id = m.chat
    const groupName = groupMetadata.subject

    let txt = `*GROUP INFORMATION*\n\n`
    txt += `◦  *Nama:* ${groupName}\n`
    txt += `◦  *ID:* ${id}\n\n`
    txt += `Klik tombol di bawah untuk menyalin ID grup.`

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
                                        display_text: "Salin ID Grup 📋",
                                        id: id,
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
    } catch (e) {
        console.error(e)
        // Fallback jika button gagal
        m.reply(`ID Grup: \`${id}\``)
    }
}

handler.help = ['idgc']
handler.tags = ['group']
handler.command = /^(getid|gcid|idgc)$/i
handler.group = true

export default handler