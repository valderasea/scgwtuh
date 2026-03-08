let handler = async (m, { conn, text, usedPrefix, command }) => { 
    try {
        if (!text) return m.reply(`*Contoh: ${usedPrefix + command} absolute|13:46|image.jpeg*\nAtau reply gambar dengan:\n*${usedPrefix + command} absolute|13:46*`);

        const args = text.split('|').map(v => v.trim());
        if (args.length < 2) return m.reply(`*Format salah!* ⚠️\n\nGunakan format:\n*${usedPrefix + command} nama|waktu|image_url*\nAtau reply gambar:\n*${usedPrefix + command} nama|waktu*`);

        const nama = args[0];
        const waktu = args[1];
        let image = args[2] || null;

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        if (!image) {
            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';
            if (!/image/.test(mime)) return m.reply(`*🍂 Reply gambar atau sertakan URL gambar!*`);

            const media = await quoted.download();
            const form = new FormData();
            form.append('files[]', new Blob([media]), 'image.png');

            const upload = await fetch('https://uguu.se/upload.php', {
                method: 'POST',
                body: form
            });

            const result = await upload.json();
            if (!result?.files?.[0]?.url) throw new Error('Upload gagal');

            image = result.files[0].url;
        }

        const params = new URLSearchParams({
            nama,
            waktu,
            image,
            apikey: 'FreeLimit'
        });

        const endpoint = `https://kayzzidgf.my.id/api/maker/fakecall?${params.toString()}`;
        const res = await fetch(endpoint);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('image')) throw new Error('Invalid image response');

        const buffer = Buffer.from(await res.arrayBuffer());

        await conn.sendMessage(m.chat, { image: buffer }, { quoted: m });

    } catch (e) {
        await m.reply(`*Gagal membuat fake call!* 🍂\n${e.message}`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};

handler.help = ['fakecall'];
handler.tags = ['maker'];
handler.command = /^(fakecall)$/i;

export default handler;