let handler = async (m, { conn }) => {
    // Ambil data dari global.owner yang formatnya [[number, name, isDev]]
    let list = global.owner.map((v, i) => {
        return `*${i + 1}.* ${v[1] || 'No Name'} (@${v[0]})\n   └ *Status:* ${v[2] ? 'Developer 🛠️' : 'Owner 👑'}`
    }).join('\n\n')

    if (!list) return m.reply('Belum ada owner yang terdaftar.')

    m.reply(`*DAFTAR OWNER BOT*\n\n${list}`, null, {
        mentions: global.owner.map(v => v[0] + '@s.whatsapp.net')
    })
}

handler.help = ['listowner']
handler.tags = ['main']
handler.command = /^(listowner|own)$/i

export default handler