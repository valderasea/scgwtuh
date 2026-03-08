import fs from 'fs'
import path from 'path'

const databaseFile = path.join(process.cwd(), 'database', 'sewa.json')

const readDB = () => {
    try {
        if (!fs.existsSync(databaseFile)) return { groups: {} }
        const content = fs.readFileSync(databaseFile, 'utf-8')
        return content ? JSON.parse(content) : { groups: {} }
    } catch (e) { return { groups: {} } }
}

const writeDB = (data) => {
    fs.writeFileSync(databaseFile, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let dbSewa = readDB()
    const input = text?.trim()
    
    let groupId = null
    let groupName = null
    
    if (!input) {
        if (!m.isGroup) return m.reply(`📝 *ᴅᴇʟ sᴇᴡᴀ*\n\n> Format: \`${usedPrefix + command} <link/id>\`\n> Atau ketik langsung di grup tujuan.`)
        groupId = m.chat
    } else if (input.includes('chat.whatsapp.com/')) {
        try {
            const inviteCode = input.split('chat.whatsapp.com/')[1]?.split(/[\s?]/)[0]
            const metadata = await conn.groupGetInviteInfo(inviteCode) 
            if (metadata?.id) groupId = metadata.id
        } catch (e) { return m.reply(`❌ *ɢᴀɢᴀʟ:* Link tidak valid.`) }
    } else {
        groupId = input.includes('@g.us') ? input : input + '@g.us'
    }
    
    if (!groupId || !dbSewa.groups || !dbSewa.groups[groupId]) {
        return m.reply(`❌ *ɢᴀɢᴀʟ:* Grup tidak terdaftar di database sewa.`)
    }
    
    groupName = dbSewa.groups[groupId].name || groupId
    delete dbSewa.groups[groupId]
    writeDB(dbSewa)
    
    m.reply(`✅ *sᴇᴡᴀ ᴅɪʜᴀᴘᴜs*\n\n┃ 🏠 ɢʀᴜᴘ: \`${groupName}\`\n┃ 🆔 ɪᴅ: \`${groupId}\`\n\n> Bot tidak akan lagi mengecek masa sewa grup ini.`)
}

handler.help = ['delsewa']
handler.tags = ['owner']
handler.command = /^(delsewa|sewadel|hapussewa)$/i
handler.owner = true

export default handler