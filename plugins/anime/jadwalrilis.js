import axios from 'axios'

let handler = async (m, { conn }) => {
    try {
        if (m.react) await m.react('📅')
        
        const { data } = await axios.get('https://fathurweb.qzz.io/api/anime/jadwalrilis')
        
        if (!data.status || !data.result) return m.reply('Gagal ambil jadwal cik!')

        let cap = `*── [ JADWAL RILIS ANIME ] ──*\n`
        cap += `*Creator:* ${data.creator}\n\n`

        data.result.forEach(res => {
            if (res.anime.length > 0) {
                cap += `*📅 ${res.day} (${res.date})*\n`
                res.anime.forEach(v => {
                    cap += `  ◦ [${v.time}] ${v.title}\n`
                    cap += `    └ ${v.episode} ${v.category}\n`
                })
                cap += '\n'
            }
        })

        await m.reply(cap.trim())
        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply(`❌ Error: API Fathur mungkin lagi limit atau down.`)
    }
}

handler.help = ['jadwalrilis']
handler.tags = ['anime']
handler.command = /^(jadwalrilis|rilisanime)$/i

export default handler