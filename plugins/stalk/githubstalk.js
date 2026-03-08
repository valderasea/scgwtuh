import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan username Github-nya!\nContoh: ${usedPrefix + command} valderasea`)

    if (m.react) await m.react('⏳')

    try {
        let api = `https://api.nexray.web.id/stalker/github?username=${encodeURIComponent(text)}`
        const { data } = await axios.get(api)

        if (!data.status) throw new Error('User nggak ketemu!')

        let res = data.result
        let caption = `*– 乂 G I T H U B  S T A L K*\n\n`
        caption += `┌  ◦ *Username:* ${res.username}\n`
        caption += `│  ◦ *ID:* ${res.id}\n`
        caption += `│  ◦ *Type:* ${res.type}\n`
        caption += `│  ◦ *Repo:* ${res.public_repo}\n`
        caption += `│  ◦ *Followers:* ${res.followers}\n`
        caption += `│  ◦ *Following:* ${res.following}\n`
        caption += `│  ◦ *Created:* ${new Date(res.created_at).toLocaleDateString('id-ID')}\n`
        caption += `│  ◦ *Updated:* ${new Date(res.updated_at).toLocaleDateString('id-ID')}\n`
        caption += `└  ◦ *Link:* ${res.url}\n\n`
        caption += `*Bio:* ${res.bio || 'Kosong'}`

        await conn.sendFile(m.chat, res.profile_pic, 'github.png', caption, m)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['githubstalk']
handler.tags = ['stalk']
handler.command = /^(githubstalk|ghstalk)$/i

export default handler