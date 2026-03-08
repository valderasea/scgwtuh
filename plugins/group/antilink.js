import fs from 'fs'

const pathData = './database/antilink.json'

let handler = async (m, { conn, args, usedPrefix, command, isBotAdmin, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply('Fitur ini cuma bisa di grup ya cik!')
    
    if (!fs.existsSync('./database')) fs.mkdirSync('./database')
    let db = fs.existsSync(pathData) ? JSON.parse(fs.readFileSync(pathData)) : {}
    
    if (!db[m.chat]) db[m.chat] = { active: false, whitelist: [], warns: {} }

    const action = args[0] ? args[0].toLowerCase() : null
    const target = args[1]

    // On/Off Antilink
    if (action === 'on' || action === 'off') {
        if (!isAdmin && !isOwner) return m.reply('Cuma admin yang punya akses buat ini cik.')
        db[m.chat].active = (action === 'on')
        if (action === 'off') db[m.chat].warns = {}
        fs.writeFileSync(pathData, JSON.stringify(db, null, 2))
        return m.reply(`✅ *Antilink berhasil di-${action === 'on' ? 'aktifkan' : 'matikan'}!*`)
    }

    // Tambah Whitelist
    if (action === '+') {
        if (!isAdmin && !isOwner) return m.reply('Khusus admin yang bisa nambah daftar aman cik.')
        if (!target) return m.reply(`Link atau domainnya mana?\nContoh: *${usedPrefix + command} + instagram.com*`)
        
        if (db[m.chat].whitelist.includes(target)) return m.reply('Link itu udah ada di daftar aman cik.')
        db[m.chat].whitelist.push(target)
        fs.writeFileSync(pathData, JSON.stringify(db, null, 2))
        return m.reply(`✅ *${target}* sekarang udah aman dikirim!`)
    }

    // Hapus Whitelist
    if (action === '-') {
        if (!isAdmin && !isOwner) return m.reply('Cuma admin yang bisa hapus daftar aman cik.')
        if (!target) return m.reply(`Mana link yang mau dihapus dari daftar aman?`)
        
        db[m.chat].whitelist = db[m.chat].whitelist.filter(l => l !== target)
        fs.writeFileSync(pathData, JSON.stringify(db, null, 2))
        return m.reply(`✅ *${target}* udah dihapus dari daftar aman ya!`)
    }

    let list = db[m.chat].whitelist.map((v, i) => `${i + 1}. ${v}`).join('\n')
    m.reply(`*ANTILINK SETTINGS*

Status: *${db[m.chat].active ? 'AKTIF ✅' : 'NONAKTIF ❌'}*
Sistem: *Auto-Kick (3x Warning)*

*Cara Pakai:*
- ${usedPrefix + command} on/off
- ${usedPrefix + command} + [domain]
- ${usedPrefix + command} - [domain]

*List Link Aman:*
${list || '- Belum ada -'}`)
}

// Logika Deteksi & Auto Kick (Event)
handler.before = async function (m, { conn, isBotAdmin }) {
    if (!m.isGroup || !isBotAdmin || m.fromMe) return
    
    let db = fs.existsSync(pathData) ? JSON.parse(fs.readFileSync(pathData)) : {}
    if (!db[m.chat] || !db[m.chat].active) return

    const linkRegex = /((https?:\/\/|www\.)[^\s]+)/g
    const foundLinks = m.text.match(linkRegex)

    if (foundLinks) {
        const targetLink = foundLinks[0].toLowerCase()
        const isWhitelisted = db[m.chat].whitelist.some(link => targetLink.includes(link.toLowerCase()))
        
        if (!isWhitelisted) {
            const groupMetadata = await conn.groupMetadata(m.chat)
            const isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
            
            if (!isAdmin) {
                if (!db[m.chat].warns) db[m.chat].warns = {}
                if (!db[m.chat].warns[m.sender]) db[m.chat].warns[m.sender] = 0
                
                db[m.chat].warns[m.sender] += 1
                let userWarns = db[m.chat].warns[m.sender]
                
                await conn.sendMessage(m.chat, { delete: m.key })

                if (userWarns >= 3) {
                    await conn.sendMessage(m.chat, { 
                        text: `🚫 *BATAS MAKSIMAL* 🚫\n\nUser @${m.sender.split('@')[0]} udah 3x kirim link dilarang. Sampe jumpa lagi ya dek!`,
                        mentions: [m.sender]
                    })
                    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                    db[m.chat].warns[m.sender] = 0
                } else {
                    await conn.sendMessage(m.chat, { 
                        text: `⚠️ *PERINGATAN [${userWarns}/3]* ⚠️\n\nSori cik @${m.sender.split('@')[0]}, jangan sebar link di sini ya. ${3 - userWarns}x lagi lo bakal dikeluarin otomatis.`,
                        mentions: [m.sender]
                    })
                }
                
                fs.writeFileSync(pathData, JSON.stringify(db, null, 2))
            }
        }
    }
}

handler.help = ['antilink']
handler.tags = ['group']
handler.command = /^(antilink)$/i
handler.group = true

export default handler