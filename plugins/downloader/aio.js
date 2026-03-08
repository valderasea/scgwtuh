import { fileTypeFromBuffer } from 'file-type';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) return m.reply(`*Contoh: ${usedPrefix + command} https://instagram.com/...*`);

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const api = `https://api.apocalypse.web.id/download/aio?url=${encodeURIComponent(text)}`;

        let res;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                res = await fetch(api);
                if (res.ok) break;
            } catch {}

            attempts++;
            if (attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        if (!res || !res.ok) {
            return m.reply(`*Server API tidak merespon setelah beberapa percobaan. (Coba lagi)*`);
        }

        const json = await res.json();
        const data = json?.result;

        if (!data || !Array.isArray(data.medias)) {
            return m.reply(`*Media tidak ditemukan.*`);
        }

        const caption = `
*AIO DOWNLOADER*

*Source:* ${data.source || '-'}
*Author:* ${data.author || data.owner?.username || '-'}
*Title:* ${data.title ? data.title.trim() : '-'}
*Like:* ${data.like_count ?? '-'}
*URL:* ${data.url}
        `.trim();

        const medias = data.medias.filter(v => v.url);

        const images = medias.filter(v => v.type === 'image');

        let video = medias.find(v =>
            v.type === 'video' &&
            (v.quality === 'no_watermark' || v.quality === 'hd_no_watermark')
        );
        if (!video) video = medias.find(v => v.type === 'video');

        let audio = medias.find(v => v.type === 'audio');

        if (images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                await conn.sendMessage(m.chat, {
                    image: { url: images[i].url },
                    caption: i === 0 ? caption : ''
                });
            }
        }

        if (video) {
            await conn.sendMessage(m.chat, {
                video: { url: video.url },
                caption
            });
        } else if (audio) {
            try {
                await conn.sendMessage(m.chat, {
                    audio: { url: audio.url },
                    mimetype: audio.mimeType || 'audio/mpeg',
                    ptt: false
                });
            } catch {
                const audioRes = await fetch(audio.url);
                const buffer = Buffer.from(await audioRes.arrayBuffer());
                const type = await fileTypeFromBuffer(buffer);

                await conn.sendMessage(m.chat, {
                    audio: buffer,
                    mimetype: type?.mime || 'audio/mpeg',
                    ptt: false
                });
            }
        }

        if (!video && images.length === 0 && !audio) {
            await conn.sendMessage(m.chat, { text: caption });
        }

    } catch (e) {
        console.error(e);
        await m.reply(`*Terjadi kesalahan saat memproses URL.*`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};

handler.help = ['aio'];
handler.tags = ['downloader'];
handler.command = /^(aio)$/i;

export default handler;