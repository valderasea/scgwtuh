import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    else who = m.quoted ? m.quoted.sender : text

    if (!who) return m.reply(`Tag atau balas nomor yang mau dihapus dari owner!\n\nContoh:\n${usedPrefix + command} @6289662866070`)

    let number = who.replace(/\D/g, '')
    
    // Cek apakah nomor ada di daftar owner
    let index = global.owner.findIndex(owner => owner[0] === number)
    if (index === -1) return m.reply('Nomor tersebut emang bukan owner, cik! 🗿')

    // 1. Hapus dari RAM biar efeknya langsung kerasa
    global.owner.splice(index, 1)

    // 2. Hapus permanen dari config.js
    try {
        const configPath = './config.js'
        let content = fs.readFileSync(configPath, 'utf8')
        
        // Regex buat nyari baris yang isinya nomor tersebut dan menghapusnya
        let regex = new RegExp(`\\s*\\[\\s*['"]${number}['"]\\s*,\\s*['"].*?['"]\\s*,\\s*true\\s*\\],?`, 'g')
        content = content.replace(regex, '')

        fs.writeFileSync(configPath, content)
        m.reply(`✅ Berhasil! @${number} sekarang udah bukan owner lagi dan datanya dihapus dari config.js.`)
    } catch (e) {
        console.error(e)
        m.reply(`⚠️ Terhapus sementara di RAM, tapi gagal ngedit config.js: ${e.message}`)
    }
}

handler.help = ['delowner']
handler.tags = ['owner']
handler.command = /^(delowner|delown)$/i
handler.rowner = true // Cuma real owner yang boleh pecat orang

export default handler