import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Contoh:\n${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ`);

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const url = text.trim();

        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return m.reply('Link YouTube ga valid cuy! Coba link lain.');
        }

        const apiUrl = `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl);

        if (!res.data.status || !res.data.result || !res.data.result.mp3) {
            return m.reply('Gagal ambil audio! Coba link lain atau API lagi error 😔');
        }

        const audioUrl = res.data.result.mp3;
        const title = res.data.result.title || 'Unknown Title';
        const thumbnail = res.data.result.thumbnail || null;

        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            caption: `*YTMP3 Berhasil!*\nJudul: ${title}\n\nDari API`,
            ...(thumbnail ? { contextInfo: { externalAdReply: { mediaUrl: audioUrl, title, sourceUrl: url, thumbnailUrl: thumbnail } } } : {})
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Error ytmp3:', e.message);
        m.reply('Gagal download audio!');
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['ytmp3 <url>'];
handler.tags = ['downloader'];
handler.command = /^(ytmp3)$/i;

export default handler;