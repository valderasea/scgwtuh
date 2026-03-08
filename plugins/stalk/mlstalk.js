import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan ID dan Zone ML!\nContoh: ${usedPrefix + command} 48390709 3064`)

    let [id, zone] = text.split(/[ /|]/)
    if (!id || !zone) return m.reply(`Format salah! Contoh: ${usedPrefix + command} 48390709 3064`)

    if (m.react) await m.react('⏳')

    try {
        let api = `https://api.nexray.web.id/stalker/v1/mlbb?id=${id}&zone=${zone}`
        const { data } = await axios.get(api)

        if (!data.status) throw new Error('Akun nggak ketemu atau API lagi sibuk!')

        let res = data.result
        let caption = `*– 乂 M L B B  S T A L K*\n\n`
        caption += `┌  ◦ *Nickname:* ${res.username}\n`
        caption += `│  ◦ *ID:* ${res.id}\n`
        caption += `│  ◦ *Zone:* ${res.zone}\n`
        caption += `└  ◦ *Region:* ${res.region}\n`

        await m.reply(caption)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['mlstalk']
handler.tags = ['stalk']
handler.command = /^(mlstalk|mlbbstalk)$/i

export default handler