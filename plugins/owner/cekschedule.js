import axios from 'axios'

let handler = async (m, { conn, usedPrefix }) => {
    try {
        let settings = global.db.data.settings[conn.user.jid]
        let text = `📊 *sᴄʜᴇᴅᴜʟᴇʀ sᴛᴀᴛᴜs*\n\n`

        // 1. Monitor Auto Sholat
        const sholatEnabled = settings?.autoSholat || false
        const sholatIcon = sholatEnabled ? '✅' : '❌'
        text += `${sholatIcon} *Auto Sholat*\n`
        text += `   └ Key: \`sholat\`\n`
        text += `   └ Status: ${sholatEnabled ? 'Running' : 'Stopped'}\n`

        if (sholatEnabled) {
            const kota = settings.autoSholatKota || { id: '1221', nama: 'SUKABUMI' }
            text += `   └ Lokasi: ${kota.nama}\n`
            
            try {
                const { data } = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${kota.id}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}`)
                if (data?.status) {
                    const j = data.data.jadwal
                    const now = new Date().toLocaleTimeString('id-ID', { hour12: false, timeZone: 'Asia/Jakarta' }).slice(0, 5)
                    
                    // Cari jadwal berikutnya
                    let next = "Besok (Subuh)"
                    if (now < j.subuh) next = `Subuh (${j.subuh})`
                    else if (now < j.dzuhur) next = `Dzuhur (${j.dzuhur})`
                    else if (now < j.ashar) next = `Ashar (${j.ashar})`
                    else if (now < j.maghrib) next = `Maghrib (${j.maghrib})`
                    else if (now < j.isya) next = `Isya (${j.isya})`
                    
                    text += `   └ Next: ${next}\n`
                }
            } catch { text += `   └ _Gagal ambil jadwal_\n` }
        }
        text += `\n`

        // 2. Monitor Sewa Checker
        const sewaEnabled = global.sewaScheduled || false
        const sewaIcon = sewaEnabled ? '✅' : '❌'
        text += `${sewaIcon} *Sewa Auto-Kick*\n`
        text += `   └ Key: \`sewa\`\n`
        text += `   └ Status: ${sewaEnabled ? 'Active' : 'Inactive'}\n`
        
        // Cek jumlah grup yang sewa
        const fs = await import('fs')
        const path = await import('path')
        const dbSewaPath = path.join(process.cwd(), 'database', 'sewa.json')
        if (fs.default.existsSync(dbSewaPath)) {
            const dbSewa = JSON.parse(fs.default.readFileSync(dbSewaPath, 'utf-8'))
            const total = Object.keys(dbSewa.groups || {}).length
            text += `   └ Terpantau: ${total} Grup\n`
        }
        text += `\n`

        // 3. Summary
        text += `━━━━━━━━━━━━━━━━━━━\n`
        text += `✅ Total Aktif: ${(sholatEnabled ? 1 : 0) + (sewaEnabled ? 1 : 0)}\n\n`
        text += `> Ketik \`${usedPrefix}autosholat on/off\`\n`
        text += `> Ketik \`${usedPrefix}checksewa\` untuk list`

        await m.reply(text)
    } catch (error) {
        m.reply(`❌ Error: ${error.message}`)
    }
}

handler.help = ['cekschedule']
handler.tags = ['owner']
handler.command = /^(cekschedule|cekscheduler|schedstatus)$/i
handler.owner = true

export default handler