import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan URL detail dari search tadi cik!\nContoh: ${usedPrefix + command} https://www.maid.my.id/manga/keiyaku-shimai/`)
    
    try {
        if (m.react) await m.react('📑')
        
        const { data } = await axios.get(`https://fathurweb.qzz.io/api/anime/doujin/detail?url=${encodeURIComponent(text)}`)
        
        if (!data.status || !data.result) return m.reply('Detail kagak ketemu cik!')

        const res = data.result
        let cap = `*${res.title}* [${res.type}]\n\n`
        cap += `々 *Status:* ${res.status}\n`
        cap += `々 *Author:* ${res.info.author}\n`
        cap += `々 *Published:* ${res.info.published}\n`
        cap += `々 *Total:* ${res.info.totalChapter}\n`
        cap += `々 *Genres:* ${res.genres.join(', ')}\n\n`
        cap += `*Synopsis:* \n${res.synopsis}\n\n`
        cap += `*── [ LIST CHAPTER ] ──*\n`

        const list = res.chapters.slice(0, 20)
        list.forEach(v => {
            cap += `• ${v.title} (${v.date})\n`
        })
        
        if (res.chapters.length > 20) {
            cap += `\n_...dan ${res.chapters.length - 20} chapter lainnya._`
        }

        await conn.sendFile(m.chat, res.cover, 'doujin_detail.jpg', cap.trim(), m)
        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply(`❌ Error: API lagi sesek atau URL salah cik.`)
    }
}

handler.help = ['doujindetail']
handler.tags = ['anime']
handler.command = /^(doujindetail|doujininfo)$/i

export default handler