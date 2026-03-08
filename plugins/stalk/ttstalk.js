import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan username TikTok-nya!\nContoh: ${usedPrefix + command} imkankecil`)

    if (m.react) await m.react('⏳')

    try {
        let api = `https://api.deline.web.id/stalker/ttstalk?username=${encodeURIComponent(text)}`
        const { data } = await axios.get(api)

        if (!data.status) throw new Error('User nggak ketemu!')

        let { user, stats } = data.result
        let caption = `*– 乂 T I K T O K  S T A L K*\n\n`
        caption += `┌  ◦ *Nickname:* ${user.nickname}\n`
        caption += `│  ◦ *Username:* ${user.uniqueId}\n`
        caption += `│  ◦ *Region:* ${user.region}\n`
        caption += `│  ◦ *Verified:* ${user.verified ? '✅' : '❌'}\n`
        caption += `│  ◦ *Followers:* ${stats.followerCount.toLocaleString()}\n`
        caption += `│  ◦ *Following:* ${stats.followingCount.toLocaleString()}\n`
        caption += `│  ◦ *Hearts:* ${stats.heartCount.toLocaleString()}\n`
        caption += `│  ◦ *Videos:* ${stats.videoCount.toLocaleString()}\n`
        caption += `└  ◦ *Bio:* ${user.signature || 'Kosong'}\n`

        await conn.sendFile(m.chat, user.avatarLarger, 'avatar.jpg', caption, m)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['ttstalk']
handler.tags = ['stalk']
handler.command = /^(ttstalk|tiktokstalk)$/i

export default handler