import sticker from '../../lib/sticker.js'

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    // Validasi input
    if (!/image|video|gif/.test(mime)) return m.reply("Reply gambar atau videonya mbut!");

    if (m.react) await m.react('⏳');
    
    try {
        let media = await q.download();
        
        // Metadata stiker ngambil dari global config lo
        let metadata = {
            packName: global.packname || 'ValL-Assistant',
            packPublish: global.author || 'ValL'
        };

        // Proses konversi pake ffmpeg + webpmux (Tanpa Sharp!)
        let stiker = await sticker.writeExif({ 
            data: media, 
            mimetype: mime 
        }, metadata);

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m });
            if (m.react) await m.react('✅');
        } else {
            throw new Error("Gagal membuat buffer stiker");
        }

    } catch (e) {
        console.error(e);
        if (m.react) await m.react('❌');
        m.reply(`> ❌ *GAGAL BIKIN STIKER*\n\n• Error: ${e.message}\n• Solusi: Pastiin ffmpeg terinstal di panel lo.`);
    }
};

handler.help = ['s', 'stiker'];
handler.tags = ['maker'];
handler.command = /^(s|stiker|sticker)$/i;

export default handler;