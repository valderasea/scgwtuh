import fs from 'fs'

const pathData = './database/confess_session.json'

let handler = async (m, { conn, text }) => {
    let db = fs.existsSync(pathData) ? JSON.parse(fs.readFileSync(pathData)) : {}
    
    let session = db[m.sender]
    if (!session) return m.reply('Gak ada pesan confess yang masuk ke lo.')
    if (!text) return m.reply('Mau bales apa?')

    if (m.react) await m.react('⏳')

    try {
        let teksBalesan = `*BALASAN CONFESS*\n\n`
        teksBalesan += `Pesan lo sebelumnya: "${session.last_message}"\n`
        teksBalesan += `Balasan: "${text}"\n\n`
        teksBalesan += `Asikin aja.`

        await conn.sendMessage(session.last_sender, { text: teksBalesan })

        delete db[m.sender]
        fs.writeFileSync(pathData, JSON.stringify(db, null, 2))

        m.reply('Balasan lo udah gue sampein ke dia!')
        if (m.react) await m.react('✅')
    } catch (e) {
        m.reply('Gagal ngirim balesan cik.')
    }
}

handler.help = ['balas']
handler.tags = ['anonim']
handler.command = /^(balas|balasconfess)$/i
handler.private = true

export default handler