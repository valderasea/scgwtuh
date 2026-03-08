import axios from 'axios'

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan nama kota!\nContoh: ${usedPrefix + command} Sukabumi`)

    if (m.react) await m.react('⏳')

    try {
        let api = `https://api.nexray.web.id/information/jadwalsholat?kota=${encodeURIComponent(text)}`
        const { data } = await axios.get(api)

        if (!data.status) throw new Error('Kota nggak ketemu!')

        let res = data.result
        let j = res.jadwal
        let caption = `*– 乂 J A D W A L  S H O L A T*\n\n`
        caption += `┌  ◦ *Kota:* ${res.kota}\n`
        caption += `│  ◦ *Periode:* ${res.periode}\n`
        caption += `│  ◦ *Tanggal:* ${j.Tanggal}\n`
        caption += `│  ◦ *Imsyak:* ${j.Imsyak}\n`
        caption += `│  ◦ *Shubuh:* ${j.Shubuh}\n`
        caption += `│  ◦ *Dzuhur:* ${j.Dzuhur}\n`
        caption += `│  ◦ *Ashr:* ${j.Ashr}\n`
        caption += `│  ◦ *Maghrib:* ${j.Maghrib}\n`
        caption += `└  ◦ *Isya:* ${j.Isya}\n\n`
        caption += `_Selamat menjalankan ibadah sholat bagi yang menjalankan._`

        await m.reply(caption)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['jadwalsholat <nama kota>']
handler.tags = ['tools']
handler.command = /^(jadwalsholat|sholat)$/i

export default handler