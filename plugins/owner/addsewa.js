import fs from 'fs'
import path from 'path'

// Path database sesuai request lo
const databaseFile = path.join(process.cwd(), 'database', 'sewa.json')

// Helper Fungsi Baca/Tulis JSON
const readDB = () => {
    try {
        if (!fs.existsSync(databaseFile)) {
            // Jika folder belum ada, buat dulu
            const dir = path.dirname(databaseFile)
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
            return { groups: {} }
        }
        const content = fs.readFileSync(databaseFile, 'utf-8')
        return content ? JSON.parse(content) : { groups: {} }
    } catch (e) {
        return { groups: {} }
    }
}

const writeDB = (data) => {
    fs.writeFileSync(databaseFile, JSON.stringify(data, null, 2))
}

// Helper Durasi
function parseDuration(str) {
    const match = str.match(/^(\d+)([dDmMyYhH])$/)
    if (!match) return null
    const value = parseInt(match[1])
    const unit = match[2].toLowerCase()
    const now = Date.now()
    let ms = 0
    if (unit === 'h') ms = value * 3600000
    else if (unit === 'd') ms = value * 86400000
    else if (unit === 'm') ms = value * 2592000000
    else if (unit === 'y') ms = value * 31536000000
    return now + ms
}

function formatDuration(str) {
    const match = str.match(/^(\d+)([dDmMyYhH])$/)
    if (!match) return str
    const units = { h: 'jam', d: 'hari', m: 'bulan', y: 'tahun' }
    return `${match[1]} ${units[match[2].toLowerCase()]}`
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (args.length < 2) {
        return m.reply(
            `📝 *ᴀᴅᴅ sᴇᴡᴀ*\n\n` +
            `> Format: \`${usedPrefix + command} <link> <durasi>\`\n` +
            `> Contoh: \`${usedPrefix + command} https://chat.whatsapp.com/xxx 30d\``
        )
    }

    const link = args[0]
    const durationStr = args[1]
    const expiredAt = parseDuration(durationStr)

    if (!link.includes('chat.whatsapp.com/')) return m.reply('❌ Link grup tidak valid!')
    if (!expiredAt) return m.reply('❌ Format durasi salah! Gunakan format seperti: `30d`, `1m`, atau `1y`.')

    try {
        const inviteCode = link.split('chat.whatsapp.com/')[1]?.split(/[\s?]/)[0]
        
        // Menggunakan method groupGetInviteInfo dari bail-lite
        const metadata = await conn.groupGetInviteInfo(inviteCode) 
        
        if (!metadata?.id) return m.reply('❌ Grup tidak ditemukan atau link sudah kadaluarsa!')

        const groupId = metadata.id
        const groupName = metadata.subject || 'Grup Sewa'

        // Baca DB dan pastikan property 'groups' sudah ada
        let dbSewa = readDB()
        if (!dbSewa.groups) dbSewa.groups = {}

        // Simpan data
        dbSewa.groups[groupId] = {
            name: groupName,
            addedAt: Date.now(),
            expiredAt: expiredAt,
            inviteCode: inviteCode
        }
        
        writeDB(dbSewa)

        const expiredStr = new Date(expiredAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })

        let sukses = `✅ *sᴇᴡᴀ ᴅɪᴛᴀᴍʙᴀʜ*\n\n` +
                     `┃ 🏠 ɢʀᴜᴘ: \`${groupName}\`\n` +
                     `┃ 🆔 ɪᴅ: \`${groupId}\`\n` +
                     `┃ ⏱️ ᴅᴜʀᴀsɪ: \`${formatDuration(durationStr)}\`\n` +
                     `┃ 📅 ᴇxᴘɪʀᴇᴅ: \`${expiredStr}\`\n\n` +
                     `> Data berhasil disimpan di \`/database/sewa.json\``
        
        m.reply(sukses)

    } catch (error) {
        m.reply(`❌ *ᴇʀʀᴏʀ:* ${error.message}`)
    }
}

handler.help = ['addsewa']
handler.tags = ['owner']
handler.command = /^(addsewa|adds)$/i
handler.owner = true

export default handler