import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let lang = args[0]
    let text = args.slice(1).join(' ')

    if (!lang || !text) {
        if (!m.quoted?.text) return m.reply(`Contoh: ${usedPrefix + command} en Halo apa kabar?\nAtau reply teksnya cik.`)
        lang = args[0] || 'en'
        text = m.quoted.text
    }

    if (m.react) await m.react('⏳')

    try {
        const url = `https://api.deline.web.id/tools/translate?text=${encodeURIComponent(text)}&target=${lang}`
        const res = await axios.get(url)
        
        if (!res.data.status) return m.reply('Gagal translate cik, cek lagi kodenya.')

        const { terdeteksi_bahasa, ke_bahasa, hasil_terjemahan } = res.data.data

        let caption = `*TRANSLATE BY VALL ASSISTANT*\n\n`
        caption += `Dari: ${terdeteksi_bahasa.toUpperCase()}\n`
        caption += `Ke: ${ke_bahasa.toUpperCase()}\n`
        caption += `Hasil: ${hasil_terjemahan}\n\n`
        caption += `Asikin aja.`

        m.reply(caption)
        
        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        m.reply("Error cik, API lagi ada kendala.")
    }
}

handler.help = ['translate']
handler.tags = ['tools']
handler.command = /^(translate|tr)$/i

export default handler