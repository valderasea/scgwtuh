let handler = async (m, { conn, command }) => {
    if (!m.quoted) return m.reply("Reply pesan yang mau lo pin atau unpin!")

    try {
        if (command === 'pin') {
            await conn.sendMessage(m.chat, {
                pin: m.quoted.vM.key,
                type: 1,
                time: 2592000
            })
        }

        if (command === 'unpin') {
            await conn.sendMessage(m.chat, {
                pin: m.quoted.vM.key,
                type: 0
            })
        }
    } catch (e) {
        console.error(e)
        m.reply("Gagal memproses pin. Pastikan bot adalah admin jika di dalam grup!")
    }
}

handler.help = ['pinchat', 'unpin']
handler.tags = ['group']
handler.command = /^(pinchat|unpin)$/i
handler.admin = true

export default handler