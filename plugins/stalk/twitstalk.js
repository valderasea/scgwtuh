import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Contoh: ${usedPrefix + command} juicee90y`)
    
    if (m.react) await m.react('🔍')

    try {
        const url = `https://api.deline.web.id/stalker/twitter?username=${encodeURIComponent(text)}`
        const res = await axios.get(url)

        if (!res.data.status) return m.reply('Username nggak ketemu cik, coba cek lagi typonya.')

        const user = res.data.result
        const legacy = user.legacy

        let caption = `*TWITTER STALK BY VALL*\n\n`
        caption += `┌  ◦  *Nama:* ${user.core.name}\n`
        caption += `│  ◦  *Username:* @${user.core.screen_name}\n`
        caption += `│  ◦  *ID:* ${user.rest_id}\n`
        caption += `│  ◦  *Bio:* ${legacy.description || '-'}\n`
        caption += `│  ◦  *Followers:* ${legacy.followers_count.toLocaleString()}\n`
        caption += `│  ◦  *Following:* ${legacy.friends_count.toLocaleString()}\n`
        caption += `│  ◦  *Tweets:* ${legacy.statuses_count.toLocaleString()}\n`
        caption += `│  ◦  *Dibuat:* ${user.core.created_at}\n`
        caption += `└  ◦  *Verified:* ${user.verification.verified ? 'Ya' : 'Tidak'}\n\n`
        caption += `Asikin aja.`

        // Kirim foto profilnya juga biar mantap
        if (user.avatar?.image_url) {
            await conn.sendFile(m.chat, user.avatar.image_url, 'twit.jpg', caption, m)
        } else {
            await m.reply(caption)
        }

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        m.reply('Error cik, API lagi ada kendala atau username salah.')
    }
}

handler.help = ['twitterstalk']
handler.tags = ['stalk']
handler.command = /^(twitterstalk|twitstalk|twstalk)$/i

export default handler