let handler = async (m, { conn, text, usedPrefix, command }) => { 
    try {
        if (!text) return m.reply(`*Contoh: ${usedPrefix + command} 35461××××××××××*`);

        if (!/^\d{14,16}$/.test(text)) {
            return m.reply(`*IMEI tidak valid.* 🍂\nMasukkan 14–16 digit angka tanpa spasi.`);
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const res = await fetch(`https://api-varhad.my.id/tools/cekimei?q=${encodeURIComponent(text)}`);
        const json = await res.json();

        if (!json.status) {
            return m.reply(`*Gagal mengambil data IMEI.* 🍂`);
        }

        const data = json.result?.result;
        if (!data || !data.header) {
            return m.reply(`*Data IMEI tidak ditemukan.* 🍂`);
        }

        const header = data.header;
        const items = data.items || [];

        let caption = `*📱 IMEI CHECK RESULT*\n\n`;
        caption += `*Brand:* ${header.brand}\n`;
        caption += `*Model:* ${header.model}\n`;
        caption += `*IMEI:* ${header.imei}\n\n`;

        let currentSection = '';

        for (let item of items) {
            if (item.role === 'header') {
                currentSection = item.title;
                caption += `*🔎 ${currentSection}*\n`;
            } else if (item.role === 'item') {
                caption += `• *${item.title}:* ${item.content}\n`;
            } else if (item.role === 'button') {
                caption += `• *${item.title}:* ${item.content}\n`;
            } else if (item.role === 'group' && Array.isArray(item.items)) {
                for (let sub of item.items) {
                    if (sub.role === 'button') {
                        caption += `• *${sub.title}:* ${sub.content}\n`;
                    }
                }
            }
        }

        caption += `\n*Service:* ${json.service}\n`;
        caption += `*Status:* ${json.result.status}\n`;
        caption += `*Requested At:* ${json.result.requested_at}\n`;

        if (header.photo) {
            await conn.sendMessage(m.chat, {
                image: { url: header.photo },
                caption
            }, { quoted: m });
        } else {
            await m.reply(caption);
        }

    } catch (e) {
        await m.reply(`*Terjadi kesalahan saat memproses IMEI.*`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};

handler.help = ['cekimei'];
handler.tags = ['tools'];
handler.command = /^(cekimei)$/i;

export default handler;