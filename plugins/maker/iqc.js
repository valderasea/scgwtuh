import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(`❌ Kasih teksnya!\nContoh: *${usedPrefix + command}* Halo apa kabar?`);
        }

        if (m.react) await m.react('🦇');

        const encodedText = encodeURIComponent(text);

        const chatTime = "08:04";
        const statusBarTime = "11:20";

        const apiUrl = `https://api.deline.web.id/maker/iqc?text=${encodedText}&chatTime=${chatTime}&statusBarTime=${statusBarTime}`;

        await conn.sendMessage(m.chat, {
            image: { url: apiUrl },
            caption: `Tuh\n\n*Text:* ${text}`
        }, { quoted: m });

        if (m.react) await m.react('✅');

    } catch (error) {
        console.error("IQC Error:", error);
        if (m.react) await m.react('❌');
        m.reply("❌ Gagal bikin gambar chat iPhone.");
    }
};

handler.help = ['iqc'];
handler.tags = ['maker'];
handler.command = /^(iqc|sschat)$/i;

export default handler;