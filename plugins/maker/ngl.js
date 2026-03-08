import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukan teksnya cik!\nContoh: ${usedPrefix + command} kapan nikah?`)
    
    try {
        if (m.react) await m.react('📩')
        
        // Title gue bikin statis sesuai request lo
        const title = encodeURIComponent("send me anonymous messages!")
        const api = `https://fathurweb.qzz.io/api/canvas/ngl?title=${title}&text=${encodeURIComponent(text)}`
        
        const response = await axios.get(api, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)

        if (buffer.length < 100) return m.reply('Gagal nge-generate gambar cik, coba lagi nanti.')

        await conn.sendFile(m.chat, buffer, 'ngl.png', `*── [ NGL ANONYMOUS ] ──*`, m)
        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply(`❌ Error: API Fathur mungkin lagi down cik.`)
    }
}

handler.help = ['ngl']
handler.tags = ['maker']
handler.command = /^(ngl|anonymous)$/i

export default handler