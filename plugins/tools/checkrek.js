import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan nomor dan nama bank!\nContoh: ${usedPrefix + command} 08xxx dana`)

    let [nomor, bank] = text.split(/[ /|]/)
    if (!nomor || !bank) return m.reply(`Format salah! Contoh: ${usedPrefix + command} 08xxx dana`)

    if (m.react) await m.react('⏳')

    try {
        let api = `https://api.nexray.web.id/information/check-rekening?number=${nomor}&bank=${bank}`
        const { data } = await axios.get(api)

        if (!data.status || !data.result.success) throw new Error('Data tidak ditemukan atau bank tidak didukung!')

        let res = data.result.data
        let caption = `*– 乂 C H E C K  R E K E N I N G*\n\n`
        caption += `┌  ◦ *Status:* ${res.status.toUpperCase()}\n`
        caption += `│  ◦ *Nomor:* ${res.account_number}\n`
        caption += `│  ◦ *Nama:* ${res.account_name}\n`
        caption += `└  ◦ *Bank/Wallet:* ${bank.toUpperCase()}\n`

        await m.reply(caption)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['checkrek']
handler.tags = ['tools']
handler.command = /^(cekrek|checkrek)$/i

export default handler