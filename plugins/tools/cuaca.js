import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan nama kota/wilayah!\nContoh: ${usedPrefix + command} Sukabumi`)

    if (m.react) await m.react('⏳')

    try {
        let api = `https://api.gimita.id/api/info/cuaca?query=${encodeURIComponent(text)}`
        const { data } = await axios.get(api)

        if (!data.success || !data.data.weather.length) throw new Error('Wilayah nggak ketemu!')

        let info = data.data.weather[0]
        let skrg = info.cuaca[0][0] // Ambil data cuaca paling update
        let lok = info.lokasi

        let caption = `*– 乂 I N F O  C U A C A*\n\n`
        caption += `┌  ◦ *Lokasi:* ${lok.desa}, ${lok.kecamatan}\n`
        caption += `│  ◦ *Kota/Kab:* ${lok.kotkab}\n`
        caption += `│  ◦ *Provinsi:* ${lok.provinsi}\n`
        caption += `│  ◦ *Waktu:* ${skrg.local_datetime}\n`
        caption += `│  ◦ *Cuaca:* ${skrg.weather_desc}\n`
        caption += `│  ◦ *Suhu:* ${skrg.t}°C\n`
        caption += `│  ◦ *Kelembapan:* ${skrg.hu}%\n`
        caption += `└  ◦ *Kec. Angin:* ${skrg.ws} km/jam\n`

        await conn.sendFile(m.chat, skrg.image, 'weather.png', caption, m)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['cuaca <nama kota>']
handler.tags = ['tools']
handler.command = /^(cuaca|weather)$/i

export default handler