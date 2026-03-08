import fs from 'fs'
import path from 'path'
import cron from 'node-cron'

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

let handler = async (m, { conn }) => {
    let dbSewa = readDB()
    if (!dbSewa.groups || Object.keys(dbSewa.groups).length === 0) return m.reply('❌ Belum ada grup yang menyewa bot.')

    let teks = `📋 *ᴅᴀꜰᴛᴀʀ sᴇᴡᴀ ᴀᴋᴛɪꜰ*\n\n`
    Object.entries(dbSewa.groups).forEach(([id, data], i) => {
        let sisa = data.expiredAt - Date.now()
        let hari = Math.floor(sisa / 86400000)
        let jam = Math.floor((sisa % 86400000) / 3600000)
        let menit = Math.floor((sisa % 3600000) / 60000)
        
        teks += `${i + 1}. *${data.name}*\n`
        teks += `   └ ID: \`${id.split('@')[0]}\`\n`
        teks += `   └ Sisa: \`${hari}h ${jam}j ${menit}m\`\n\n`
    })
    m.reply(teks)
}

// --- AUTO KICK SCHEDULER (Jalan tiap menit) ---
handler.before = async function (m, { conn }) {
    if (global.sewaScheduled) return
    global.sewaScheduled = true

    cron.schedule('* * * * *', async () => {
        let dbSewa = readDB()
        if (!dbSewa.groups) return
        
        let now = Date.now()
        let changed = false

        for (let jid in dbSewa.groups) {
            let group = dbSewa.groups[jid]
            if (now >= group.expiredAt) {
                try {
                    await conn.sendMessage(jid, { 
                        text: `🚫 *ᴍᴀsᴀ sᴇᴡᴀ ʜᴀʙɪs*\n\nTerima kasih sudah menggunakan bot ini. Bot akan otomatis keluar. Bye! 👋` 
                    })
                    await new Promise(res => setTimeout(res, 2000))
                    await conn.groupLeave(jid) 
                    
                    delete dbSewa.groups[jid]
                    changed = true
                } catch (e) { console.error(`Gagal kick sewa ${jid}:`, e.message) }
            }
        }
        if (changed) writeDB(dbSewa)
    }, { scheduled: true, timezone: "Asia/Jakarta" })
}

handler.help = ['listsewa']
handler.tags = ['owner']
handler.command = /^(listsewa|checksewa|sewalist)$/i
handler.owner = true

export default handler