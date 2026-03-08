import fs from 'fs'

const pathData = './database/antitoxic.json'

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply('Cuma bisa di grup ya cik!')
    
    if (!fs.existsSync('./database')) fs.mkdirSync('./database')
    let db = fs.existsSync(pathData) ? JSON.parse(fs.readFileSync(pathData)) : {}
    
    // Inisialisasi data grup
    if (!db[m.chat]) db[m.chat] = { active: false, badwords: ["ajg",
  "ancok",
  "anj",
  "anjg",
  "anjim",
  "anjing",
  "anjink",
  "asu",
  "asuu",
  "asw",
  "ba'bi",
  "babi",
  "babii",
  "babiii",
  "bangsat",
  "bangst",
  "bgst",
  "bngst",
  "djancok",
  "itil",
  "jancok",
  "jembut",
  "jembwt",
  "jmbt",
  "khontol",
  "kimak",
  "kntl",
  "kntol",
  "kon",
  "kontl",
  "kontol",
  "kuntul",
  "memeg",
  "memek",
  "memekk",
  "mwmwk",
  "ngentod",
  "ngentot",
  "pantat",
  "peler",
  "pepek",
  "sagne",
  "sange"], warns: {} }

    const action = args[0] ? args[0].toLowerCase() : null
    const target = args[1] ? args[1].toLowerCase() : null

    // 1. On/Off Anti-Toxic
    if (action === 'on' || action === 'off') {
        if (!isAdmin && !isOwner) return m.reply('Admin doang yang bisa nentuin cik.')
        db[m.chat].active = (action === 'on')
        if (action === 'off') db[m.chat].warns = {}
        fs.writeFileSync(pathData, JSON.stringify(db, null, 2))
        return m.reply(`✅ *Anti-toxic berhasil di-${action === 'on' ? 'aktifkan' : 'matikan'}!*`)
    }

    // 2. Tambah Kata Kasar (+)
    if (action === '+') {
        if (!isAdmin && !isOwner) return m.reply('Cuma admin yang bisa nambah kata terlarang.')
        if (!target) return m.reply(`Katanya mana cik?\nContoh: *${usedPrefix + command} + typo*`)
        if (db[m.chat].badwords.includes(target)) return m.reply('Kata itu udah ada di list cik.')
        
        db[m.chat].badwords.push(target)
        fs.writeFileSync(pathData, JSON.stringify(db, null, 2))
        return m.reply(`✅ Kata *${target}* sekarang dilarang ya!`)
    }

    // 3. Hapus Kata Kasar (-)
    if (action === '-') {
        if (!isAdmin && !isOwner) return m.reply('Cuma admin yang bisa hapus kata terlarang.')
        if (!target) return m.reply(`Mana kata yang mau dihapus?`)
        
        db[m.chat].badwords = db[m.chat].badwords.filter(w => w !== target)
        fs.writeFileSync(pathData, JSON.stringify(db, null, 2))
        return m.reply(`✅ Kata *${target}* udah boleh diucapin lagi.`)
    }

    let list = db[m.chat].badwords.map((v, i) => `${i + 1}. ${v}`).join('\n')
    m.reply(`*🚫 ANTI-TOXIC SETTINGS 🚫*

Status: *${db[m.chat].active ? 'AKTIF ✅' : 'NONAKTIF ❌'}*
Sistem: *3x Warn = Kick*

*Cara Pakai:*
- ${usedPrefix + command} on/off
- ${usedPrefix + command} + [kata]
- ${usedPrefix + command} - [kata]

*List Kata Terlarang:*
${list || '- Kosong -'}`)
}

// Logika Deteksi Toxic (Event)
handler.before = async function (m, { conn, isBotAdmin }) {
    if (!m.isGroup || !isBotAdmin || m.fromMe) return
    
    let db = fs.existsSync(pathData) ? JSON.parse(fs.readFileSync(pathData)) : {}
    if (!db[m.chat] || !db[m.chat].active) return

    const message = m.text.toLowerCase()
    const badwords = db[m.chat].badwords
    
    // Cek apakah ada kata kasar di pesan
    const isToxic = badwords.some(word => message.includes(word))

    if (isToxic) {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
        
        if (!isAdmin) {
            if (!db[m.chat].warns) db[m.chat].warns = {}
            if (!db[m.chat].warns[m.sender]) db[m.chat].warns[m.sender] = 0
            
            db[m.chat].warns[m.sender] += 1
            let userWarns = db[m.chat].warns[m.sender]
            
            // Hapus pesan toxic
            await conn.sendMessage(m.chat, { delete: m.key })

            if (userWarns >= 3) {
                await conn.sendMessage(m.chat, { 
                    text: `🚫 *BATAS TOXIC* 🚫\n\nUser @${m.sender.split('@')[0]} udah 3x ngomong kasar. Sampe jumpa lagi ya cik!`,
                    mentions: [m.sender]
                })
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                db[m.chat].warns[m.sender] = 0
            } else {
                await conn.sendMessage(m.chat, { 
                    text: `⚠️ *TOXIC DETECTED [${userWarns}/3]* ⚠️\n\nSori cik @${m.sender.split('@')[0]}, tolong bahasanya kondisikan ya. ${3 - userWarns}x lagi lo bakal dikeluarin.`,
                    mentions: [m.sender]
                })
            }
            
            fs.writeFileSync(pathData, JSON.stringify(db, null, 2))
        }
    }
}

handler.help = ['antitoxic']
handler.tags = ['group']
handler.command = /^(antitoxic|badword)$/i
handler.group = true

export default handler