let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (command === 'fakedev') {
            return m.reply(`*FAKE DEV GENERATOR*

Pilih salah satu:

${usedPrefix}fakedev1 <nama> <true/false> [url]
${usedPrefix}fakedev2 <nama> [url]
${usedPrefix}fakedev3 <nama> <true/false> [url]

Bisa reply gambar atau langsung pakai URL.`);
        }

        if (!text) {
            if (command === 'fakedev1') {
                return m.reply(`*Contoh penggunaan fakedev1:*

*Reply gambar:*
${usedPrefix}fakedev1 Nama true
${usedPrefix}fakedev1 Nama false

*Pakai URL:*
${usedPrefix}fakedev1 Nama true https://example.com/image.jpg`);
            }

            if (command === 'fakedev2') {
                return m.reply(`*Contoh penggunaan fakedev2:*

*Reply gambar:*
${usedPrefix}fakedev2 Nama

*Pakai URL:*
${usedPrefix}fakedev2 Nama https://example.com/image.jpg`);
            }

            if (command === 'fakedev3') {
                return m.reply(`*Contoh penggunaan fakedev3:*

*Reply gambar:*
${usedPrefix}fakedev3 Nama true
${usedPrefix}fakedev3 Nama false

*Pakai URL:*
${usedPrefix}fakedev3 Nama true https://example.com/image.jpg`);
            }
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        let args = text.trim().split(/\s+/);
        let name = args[0];
        let verified = 'false';
        let imageUrl = null;

        if (command === 'fakedev1' || command === 'fakedev3') {
            verified = (args[1] || '').toLowerCase();
            if (!['true', 'false'].includes(verified)) {
                return m.reply(`*Parameter verified wajib true / false.* 🍂`);
            }
            imageUrl = args[2] || null;
        } else {
            imageUrl = args[1] || null;
        }

        if (!imageUrl) {
            let q = m.quoted ? m.quoted : m;
            let mime = (q.msg || q).mimetype || '';

            if (!/image/.test(mime)) {
                return m.reply(`*Kirim/reply gambar atau sertakan URL gambar.* 🍂`);
            }

            let media = await q.download();
            let bufferUpload = Buffer.from(media);

            let form = new FormData();
            form.append('files[]', new Blob([bufferUpload]), 'image.jpg');

            const upload = await fetch('https://uguu.se/upload.php', {
                method: 'POST',
                body: form
            });

            let upRes = await upload.json().catch(() => null);

            if (!upRes || !upRes.files || !upRes.files[0] || !upRes.files[0].url) {
                return m.reply(`*Gagal mengupload gambar.* 🍂`);
            }

            imageUrl = upRes.files[0].url;
        }

        let apiUrl;

        if (command === 'fakedev1') {
            apiUrl = `https://kayzzidgf.my.id/api/maker/fakedev?text=${encodeURIComponent(name)}&image=${encodeURIComponent(imageUrl)}&verified=${verified}&apikey=FreeLimit`;
        } else if (command === 'fakedev3') {
            apiUrl = `https://kayzzidgf.my.id/api/maker/fakedev3?text=${encodeURIComponent(name)}&image=${encodeURIComponent(imageUrl)}&verified=${verified}&apikey=FreeLimit`;
        } else {
            apiUrl = `https://kayzzidgf.my.id/api/maker/fakedev2?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(name)}&apikey=FreeLimit`;
        }

        let res = await fetch(apiUrl);

        if (!res.ok) {
            return m.reply(`*Gagal mengambil hasil dari server.* 🍂`);
        }

        const buffer = Buffer.from(await res.arrayBuffer());

        await conn.sendMessage(
            m.chat,
            { image: buffer },
            { quoted: m }
        );

    } catch (e) {
        await m.reply(`*Terjadi kesalahan saat memproses permintaan.* 🍂`);
    } finally {
        if (command !== 'fakedev') {
            await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
        }
    }
};

handler.help = ['fakedev'];
handler.tags = ['maker'];
handler.command = /^(fakedev|fakedev1|fakedev2|fakedev3)$/i;

export default handler;