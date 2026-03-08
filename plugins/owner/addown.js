import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    if (!who) return m.reply(`Tag nomornya dong cik!`)

    let number = who.replace(/\D/g, '')
    let name = conn.getName(who)

    if (global.owner.some(owner => owner[0] === number)) return m.reply('Udah jadi owner kok!')

    // 1. Tambah ke RAM biar langsung aktif sekarang
    global.owner.push([number, name, true])

    // 2. Tulis permanen ke config.js
    try {
        const configPath = './config.js'
        let content = fs.readFileSync(configPath, 'utf8')
        
        // Pakai regex $1 biar gak nimpa owner yang udah ada
        let newEntry = `\n  ['${number}', '${name}', false],`
        content = content.replace(/(global\.owner\s*=\s*\[)/, `$1${newEntry}`)

        fs.writeFileSync(configPath, content)
        m.reply(`✅ Berhasil! @${number} udah ditambahin jadi owner.`)
    } catch (e) {
        console.error(e)
        m.reply(`⚠️ Gagal nulis ke file: ${e.message}`)
    }
} // <--- KURUNG INI TADI ILANG CIK!

handler.help = ['addowner']
handler.tags = ['owner']
handler.command = /^(addowner|addown)$/i
handler.rowner = true 

export default handler