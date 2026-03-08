import axios from 'axios'

let handler = async (m, {
    text,
    usedPrefix,
    command
}) => {
    if (!text) {
        return m.reply(`Masukkan pertanyaan!`)
    }

    let res = await axios.post(
        'https://theturbochat.com/chat', {
            message: text,
            model: 'gpt-3.5-turbo',
            language: 'en'
        }, {
            headers: {
                'content-type': 'application/json',
                'origin': 'https://theturbochat.com',
                'referer': 'https://theturbochat.com/',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
                'accept': 'application/json, text/plain, */*'
            }
        }
    )

    let out = res?.data?.choices?.[0]?.message?.content
    if (!out) throw 'gagal'

    return m.reply(out.trim())
}

handler.help = ['turbochat']
handler.tags = ['ai']
handler.command = ['turbochat']

export default handler