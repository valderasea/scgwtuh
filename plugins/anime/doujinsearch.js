import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan judul doujin yang mau dicari cik!\nContoh: ${usedPrefix + command} wakamono`)
    
    try {
        if (m.react) await m.react('🔍')
        
        const { data } = await axios.get(`https://fathurweb.qzz.io/api/anime/doujin/search?q=${encodeURIComponent(text)}`)
        
        if (!data.status || !data.result || data.result.length === 0) return m.reply('Doujin kagak ketemu cik!')

        let cap = `*── [ DOUJIN SEARCH ] ──*\n\n`
        
        // Ambil 5 hasil teratas biar gak spam gambar
        const results = data.result.slice(0, 5)

        for (let v of results) {
            cap += `*${v.title}*\n`
            cap += `  ◦ Type: ${v.type}\n`
            cap += `  ◦ Score: ${v.score}\n`
            cap += `  ◦ Detail: ${v.detail_api}\n\n`
        }

        // Kirim gambar hasil pertama sebagai thumbnail utama
        await conn.sendFile(m.chat, results[0].thumbnail, 'doujin.jpg', cap.trim(), m)
        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply(`❌ Error: API Fathur mungkin lagi limit atau kena proteksi.`)
    }
}

handler.help = ['doujinsearch']
handler.tags = ['anime']
handler.command = /^(doujinsearch|doujins)$/i

export default handler