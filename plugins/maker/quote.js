let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const q = m.quoted ? m.quoted : m
        const mime = (q.msg || q).mimetype || ''

        if (!text) {
            return m.reply(`*Example:*

➜ ${usedPrefix + command} SXZnightmare @sxzoffc "5:47 AM · Sep 27, 2025" true Hello world https://example.com/pfp.jpg

➜ Reply/kirim gambar dengan:
${usedPrefix + command} SXZnightmare @sxzoffc "5:47 AM · Sep 27, 2025" false

*Format:*
username handle time verified tweet pfp

*Parameter:*
• *username* : Nama akun yang tampil
• *handle* : Username akun *(contoh: @sxzoffc)*
• *time* : Waktu tweet ditampilkan
• *verified* : Status centang akun *(true / false)*
• *pfp* : Link foto profil *(opsional / bisa reply gambar)*
• *tweet* : Isi tweet / quote`)
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        let username, handle, time, verified, tweet, pfp = null

        if (text.includes('"')) {

            const args = text.match(/"[^"]+"|\S+/g) || []

            username = args[0]
            handle = args[1]
            time = args[2]?.replace(/"/g, '')
            verified = args[3]

            const isUrl = s => /^https?:\/\//i.test(s || '')

            let remaining = args.slice(4)

            const urlIndex = remaining.findIndex(v => isUrl(v))

            if (urlIndex !== -1) {
                pfp = remaining[urlIndex]
                remaining.splice(urlIndex, 1)
            }

            tweet = remaining.join(' ')

        } else {

            const parts = text.trim().split(/\s+/)

            username = parts.shift()
            handle = parts.shift()

            let verifiedIndex = parts.findIndex(v => /^(true|false)$/i.test(v))

            if (verifiedIndex === -1) {
                return m.reply('🍂 *Parameter verified tidak ditemukan.*')
            }

            time = parts.slice(0, verifiedIndex).join(' ')
            verified = parts[verifiedIndex]

            let remaining = parts.slice(verifiedIndex + 1)

            const isUrl = s => /^https?:\/\//i.test(s || '')

            const urlIndex = remaining.findIndex(v => isUrl(v))

            if (urlIndex !== -1) {
                pfp = remaining[urlIndex]
                remaining.splice(urlIndex, 1)
            }

            tweet = remaining.join(' ')
        }

        verified = String(verified).toLowerCase() === 'true'

        if (!tweet) {
            return m.reply('🍂 *Teks quote tidak ditemukan.*')
        }

        if (!pfp && mime.startsWith('image/')) {
            let media = await q.download()

            let form = new FormData()
            form.append('files[]', new Blob([media]), 'image.jpg')

            let upload = await fetch('https://uguu.se/upload.php', {
                method: 'POST',
                body: form
            })

            let json = await upload.json()
            pfp = json.files?.[0]?.url
        }

        if (!pfp) {
            return m.reply('🍂 *Foto profil tidak ditemukan.*\n\nKirim atau reply gambar, atau sertakan URL gambar.')
        }

        let api = `https://myapi.radzzoffc.tech/gen/quote?username=${encodeURIComponent(username)}&handle=${encodeURIComponent(handle)}&text=${encodeURIComponent(tweet)}&time=${encodeURIComponent(time)}&verified=${verified}&pfp=${encodeURIComponent(pfp)}`

        let res = await fetch(api)
        if (!res.ok) throw new Error('Fetch gagal')

        let buffer = Buffer.from(await res.arrayBuffer())

        await conn.sendMessage(m.chat, {
            image: buffer
        }, { quoted: m })

    } catch (e) {
        m.reply(`🍂 *Gagal membuat quote image.*\n\n*Error:* ${e.message}`)
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    }
}

handler.help = ['quote'];
handler.tags = ['maker'];
handler.command = /^(quote|quoted)$/i;

export default handler