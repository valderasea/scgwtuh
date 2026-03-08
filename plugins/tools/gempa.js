import axios from 'axios'

let handler = async (m, { conn }) => {
    if (m.react) await m.react('⏳')

    try {
        let api = `https://api.nexray.web.id/information/gempa`
        const { data } = await axios.get(api)

        if (!data.status) throw new Error('Gagal ambil data gempa!')

        let res = data.result
        let caption = `*– 乂 I N F O  G E M P A*\n\n`
        caption += `┌  ◦ *Tanggal:* ${res.Tanggal}\n`
        caption += `│  ◦ *Waktu:* ${res.Jam}\n`
        caption += `│  ◦ *Magnitude:* ${res.Magnitude} SR\n`
        caption += `│  ◦ *Kedalaman:* ${res.Kedalaman}\n`
        caption += `│  ◦ *Lokasi:* ${res.Wilayah}\n`
        caption += `│  ◦ *Koordinat:* ${res.Coordinates}\n`
        caption += `└  ◦ *Potensi:* ${res.Potensi}\n\n`
        caption += `*Note:* ${res.Dirasakan !== '-' ? 'Dirasakan: ' + res.Dirasakan : 'Data dirasakan belum tersedia.'}`

        await conn.sendFile(m.chat, res.Shakemap, 'gempa.jpg', caption, m)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['infogempa']
handler.tags = ['tools']
handler.command = /^(gempa|infogempa)$/i

export default handler