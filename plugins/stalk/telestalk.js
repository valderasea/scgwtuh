import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan username Telegram yang mau distalk cik!\nContoh: ${usedPrefix + command} awasadaval`)
    
    try {
        if (m.react) await m.react('🔍')
        
        const { data } = await axios.get(`https://zelapioffciall.koyeb.app/stalk/telegram?username=${text.replace('@', '')}`)
        
        if (!data.status || !data.result) return m.reply('Username kagak ketemu cik!')

        const res = data.result
        let cap = `*── [ TELEGRAM STALK ] ──*\n\n`
        cap += `々 *Name:* ${res.title}\n`
        cap += `々 *Username:* @${res.username}\n`
        cap += `々 *Bio:* ${res.bio || '-'}\n`
        cap += `々 *Link:* ${res.link}\n`

        await conn.sendFile(m.chat, res.profile_picture, 'pfp.jpg', cap.trim(), m)
        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply(`❌ Error: API kemungkinan lagi down atau username salah cik.`)
    }
}

handler.help = ['tgstalk']
handler.tags = ['stalk']
handler.command = /^(tgstalk|tele|stalktele)$/i

export default handler