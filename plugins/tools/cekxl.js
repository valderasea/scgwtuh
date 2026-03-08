let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(
                `Contoh Penggunaan: 08xxxx atau 62xxxx\n` +
                `📌 *Prefix XL:* 0817, 0818, 0819, 0877, 0878\n` +
                `📌 *Prefix AXIS:* 0831, 0832, 0833, 0838`
            );
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        let number = text.replace(/\D/g, '');

        if (number.startsWith('08')) {
            number = '62' + number.slice(1);
        }

        if (!/^62\d{8,15}$/.test(number)) {
            return m.reply(`*Format nomor tidak valid!*\nGunakan format 08xxxx atau 62xxxx`);
        }

        const res = await fetch(`https://bendith.my.id/end.php?check=package&number=${number}&version=2`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
            }
        });

        const data = await res.json();

        if (!data.success) {
            return m.reply(`*Nomor tidak aktif atau bukan pelanggan XL/AXIS.*`);
        }

        const subs = data.data?.subs_info;
        const pack = data.data?.package_info;
        const volte = subs?.volte || {};
        const packages = pack?.packages || [];

        let teks = `📱 *CEK NOMOR XL / AXIS*\n\n`;
        teks += `🔢 *Nomor:* ${subs.msisdn}\n`;
        teks += `🏷️ *Operator:* ${subs.operator}\n`;
        teks += `🪪 *NIK Terverifikasi:* ${subs.id_verified}\n`;
        teks += `📶 *Jaringan:* ${subs.net_type}\n`;
        teks += `⏳ *Masa Aktif:* ${subs.exp_date}\n`;
        teks += `📆 *Masa Tenggang:* ${subs.grace_until}\n`;
        teks += `🗓️ *Tenure:* ${subs.tenure}\n\n`;

        teks += `📡 *Status VoLTE:*\n`;
        teks += `   • Device: ${volte.device ? 'Aktif ✅' : 'Tidak ❌'}\n`;
        teks += `   • Area: ${volte.area ? 'Mendukung ✅' : 'Tidak ❌'}\n`;
        teks += `   • SIM Card: ${volte.simcard ? 'Aktif ✅' : 'Tidak ❌'}\n\n`;

        if (packages.length === 0) {
            teks += `📦 *Paket Aktif:* Tidak ada paket aktif.`;
        } else {
            teks += `📦 *Paket Aktif:*\n`;
            for (let i = 0; i < packages.length; i++) {
                const p = packages[i];
                teks += `\n${i + 1}. *${p.name || 'Unknown Package'}*\n`;
                teks += `   📅 Exp: ${p.exp_date || '-'}\n`;
                teks += `   📊 Kuota: ${p.quota || '-'}\n`;
            }
        }

        await m.reply(teks.trim());

    } catch (e) {
        await m.reply(`*Terjadi kesalahan saat memproses permintaan.*\n${e.message}`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};

handler.help = ['cekxl'];
handler.tags = ['tools'];
handler.command = /^(cekxl|cekaxis)$/i;

export default handler;