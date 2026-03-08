import axios from 'axios'

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan judul lagunya!\nContoh: ${usedPrefix + command} Kau Masih Kekasihku`)

    if (m.react) await m.react('⏳')

    try {
        let api = `https://api.deline.web.id/tools/lyrics?title=${encodeURIComponent(text)}`
        const { data } = await axios.get(api)

        if (!data.status || data.result.length === 0) throw new Error('Lirik nggak ketemu!')

        let res = data.result[0]
        let lirik = `*${res.name.toUpperCase()}*\n`
        lirik += `Artist: ${res.artistName}\n`
        lirik += `Album: ${res.albumName}\n`
        lirik += `─────────────────\n\n`
        lirik += res.plainLyrics

        await m.reply(lirik)
        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['lirik']
handler.tags = ['tools']
handler.command = /^(lyrics|lirik)$/i

export default handler