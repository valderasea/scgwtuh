import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan username Roblox-nya!\nContoh: ${usedPrefix + command} valravvya`)

    if (m.react) await m.react('⏳')

    try {
        let api = `https://api.nexray.web.id/stalker/roblox?username=${encodeURIComponent(text)}`
        const { data } = await axios.get(api)

        if (!data.status) throw new Error('User nggak ketemu!')

        let res = data.result
        let b = res.basic
        let s = res.social

        let caption = `*– 乂 R O B L O X  S T A L K*\n\n`
        caption += `┌  ◦ *Display:* ${b.displayName}\n`
        caption += `│  ◦ *Username:* ${b.name}\n`
        caption += `│  ◦ *ID:* ${res.userId}\n`
        caption += `│  ◦ *Created:* ${new Date(b.created).toLocaleDateString('id-ID')}\n`
        caption += `│  ◦ *Banned:* ${b.isBanned ? '✅' : '❌'}\n`
        caption += `│  ◦ *Friends:* ${s.friends.count}\n`
        caption += `│  ◦ *Followers:* ${s.followers.count}\n`
        caption += `│  ◦ *Following:* ${s.following.count}\n`
        caption += `└  ◦ *Bio:* ${b.description || '-'}\n`

        let image = res.avatar.headshot.data[0].imageUrl

        await conn.sendFile(m.chat, image, 'roblox.png', caption, m)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['robloxstalk']
handler.tags = ['stalk']
handler.command = /^(robloxstalk|rbxstalk)$/i

export default handler