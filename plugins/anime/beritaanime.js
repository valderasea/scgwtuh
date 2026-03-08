import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        if (m.react) await m.react('🗞️')
        
        const { data } = await axios.get('https://fathurweb.qzz.io/api/anime/berita')
        
        if (!data.status || !data.result || data.result.length === 0) return m.reply('Gagal ambil berita anime cik!')

        // Ambil 5 berita terbaru biar gak spam
        let news = data.result.slice(0, 5)
        let cap = `*── [ ANIME NEWS UPDATE ] ──*\n\n`
        
        for (let i = 0; i < news.length; i++) {
            cap += `${i + 1}. *${news[i].title}*\n`
            cap += `   ◦ Rilis: ${news[i].date}\n`
            cap += `   ◦ ID: ${news[i].id}\n\n`
        }

        // Pake gambar berita pertama sebagai thumbnail utama
        await conn.sendFile(m.chat, news[0].image, 'news.jpg', cap.trim(), m)
        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply(`❌ Error: API Fathur mungkin lagi down atau limit.`)
    }
}

handler.help = ['beritaanime']
handler.tags = ['anime']
handler.command = /^(beritaanime|newsanime|animes)$/i

export default handler