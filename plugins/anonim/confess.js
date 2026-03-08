import fs from 'fs'

const pathData = './database/confess_session.json'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!fs.existsSync('./database')) fs.mkdirSync('./database')
    let db = fs.existsSync(pathData) ? JSON.parse(fs.readFileSync(pathData)) : {}

    let [jid, pesan] = text.split('|')
    if (!jid || !pesan) return m.reply(`Contoh: ${usedPrefix + command} 628xxx|Hai manis`)

    jid = jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    if (jid === m.sender) return m.reply('Jangan kirim ke diri sendiri cik.')

    if (m.react) await m.react('⏳')

    try {
        let teks = `*HAI ADA PESAN BUATMU*\n\n`
        teks += `Pesan: "${pesan}"\n\n`
        teks += `Ketik *.balas* [pesan] buat bales secara rahasia juga.`

        await conn.sendMessage(jid, { text: teks })

        db[jid] = {
            last_sender: m.sender,
            last_message: pesan,
            time: Date.now()
        }
        fs.writeFileSync(pathData, JSON.stringify(db, null, 2))

        m.reply('Pesan rahasia terkirim!')
        if (m.react) await m.react('✅')
    } catch (e) {
        m.reply('Gagal, kayaknya nomornya gak ada.')
    }
}

handler.help = ['confess']
handler.tags = ['anonim']
handler.command = /^(confess|menfess)$/i
handler.private = true

export default handler