let handler = async (m, { conn, text, usedPrefix, command }) => { 
    try {
        const cmd = command.toLowerCase();

        if (!text) {
            const example = cmd === 'fakedanav2'
                ? `*Fake Dana Generator*\n\n*Example:*\n\n➜ .fakedana 1.000.000\n➜ ${usedPrefix + command} 5.000.000\n\n*Perbedaan versi:*\n• *fakedana* ➜ Tampilan saldo Dana *mode landscape*\n• *fakedanav2* ➜ Tampilan aplikasi Dana *mode full portrait*`
                : `*Fake Dana Generator*\n\n*Example:*\n\n➜ ${usedPrefix + command} 1.000.000\n➜ .fakedanav2 5.000.000\n\n*Perbedaan versi:*\n• *fakedana* ➜ Tampilan saldo Dana *mode landscape*\n• *fakedanav2* ➜ Tampilan aplikasi Dana *mode full portrait*`;

            return m.reply(example);
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const nominal = encodeURIComponent(text);
        const endpoint = cmd === 'fakedanav2'
            ? `https://api.zenzxz.my.id/maker/fakedanav2?nominal=${nominal}`
            : `https://api.zenzxz.my.id/maker/fakedana?nominal=${nominal}`;

        const res = await fetch(endpoint);

        if (!res.ok) throw new Error('Request failed');

        const buffer = Buffer.from(await res.arrayBuffer());

        await conn.sendMessage(m.chat, {
            image: buffer
        }, { quoted: m });

    } catch {
        m.reply(`🍂 *Gagal membuat gambar Fake Dana.*\n\n*Kemungkinan penyebab:*\n• API sedang bermasalah\n• Nominal tidak valid\n• Server tidak merespon`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};

handler.help = ['fakedana'];
handler.tags = ['maker'];
handler.command = /^(fakedana|fakedanav2)$/i;

export default handler;