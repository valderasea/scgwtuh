import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Ngambil teks: dari reply (quoted) atau dari teks setelah command
    let txt = m.quoted ? m.quoted.text : text
    
    if (!txt) {
        return m.reply(
            `📋 *ᴘᴀsᴛᴇʙɪɴ ᴜᴘʟᴏᴀᴅ*\n\n` +
            `Kirim teks untuk di-upload ke Pastebin.\n\n` +
            `*Cara pakai:*\n` +
            `• \`${usedPrefix + command} <text>\`\n` +
            `• Reply teks dengan \`${usedPrefix + command}\`\n\n` +
            `> Contoh: \`${usedPrefix + command} console.log("Hello")\``
        )
    }
    
    // API Key bawaan dari kode yang lo pungut (moga masih idup)
    const api_dev_key = 'h9WMT2Mn9QW-qDhvUSc-KObqAYcjI0he'
    const api_paste_code = txt.trim()
    const api_paste_name = `Paste dari ${m.name || 'User'} - ${new Date().toLocaleDateString('id-ID')}`
    
    const data = new URLSearchParams({
        api_dev_key,
        api_option: 'paste',
        api_paste_code,
        api_paste_name,
        api_paste_private: '1' // 1 artinya unlisted (cuma yg punya link yg tau)
    })
    
    try {
        const res = await axios.post('https://pastebin.com/api/api_post.php', data.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 15000
        })
        
        const url = res.data
        
        if (url.startsWith('Bad API request')) {
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${url}`)
        }
        
        // Sesuaikan dengan format sendMessage bot lo
        await conn.sendMessage(m.chat, {
            text: `✅ *ᴘᴀsᴛᴇʙɪɴ ʙᴇʀʜᴀsɪʟ*\n\n` +
                `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
                `┃ 📝 ᴊᴜᴅᴜʟ: *${api_paste_name}*\n` +
                `┃ 📊 ᴜᴋᴜʀᴀɴ: *${txt.length} chars*\n` +
                `┃ 🔗 ʟɪɴᴋ: ${url}\n` +
                `╰┈┈⬡\n\n` +
                `> Paste akan expired sesuai pengaturan Pastebin.`,
            contextInfo: {
                externalAdReply: {
                    title: 'Pastebin Upload',
                    body: api_paste_name,
                    thumbnailUrl: 'https://pastebin.com/i/facebook.png',
                    sourceUrl: url,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })
        
    } catch (e) {
        console.error(e)
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Gagal upload ke Pastebin.\n> ${e.message}`)
    }
}

// Sesuaikan metadata dengan gaya bot lo
handler.help = ['upastebin', 'pb']
handler.tags = ['tools']
handler.command = /^(upastebin|pb|paste)$/i

export default handler