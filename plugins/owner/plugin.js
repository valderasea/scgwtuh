import path from 'path';
import fs from 'fs';
import js_beautify from 'js-beautify';
import { fileURLToPath } from 'url';
import { join } from 'path';

// Ambil path folder plugins dari global yang lo set di main.js
const pluginFolder = join(process.cwd(), 'plugins'); 

function safeReply(m, text) {
    try {
        if (typeof text !== "string") {
            text = JSON.stringify(text, null, 2);
        }
        return m.reply(text);
    } catch (e) {
        return m.reply("Gagal mengirim reply (error format).");
    }
}

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
    // Ambil daftar plugin dari global.plugins
    const listCmd = Object.keys(global.plugins);

    const [option, ...pathParts] = args;
    const fullPathOrIndex = pathParts.join(' ').trim();

    if (!option || !['+', '-', '?'].includes(option[0]) || !fullPathOrIndex) {
        let replyText = `Gunakan format: \`${usedPrefix + command} [opsi] [nomor atau path/file]\`\n\n`;
        replyText += `*Opsi:*\n`;
        replyText += `  \`+\` : Tambah/simpan plugin\n`;
        replyText += `  \`-\` : Hapus plugin\n`;
        replyText += `  \`?\` : Ambil kode plugin\n\n`;
        replyText += `*Contoh:*\n`;
        replyText += `\`${usedPrefix + command} - 2\` (menghapus plugin nomor 2)\n`;
        replyText += `\`${usedPrefix + command} + owner/test.js\` (balas kode)\n\n`;
        replyText += `*– Daftar Plugin Tersedia:*\n`;
        replyText += listCmd.map((p, i) => `  \`${i + 1}.\` \`${p}\``).join("\n");
        return safeReply(m, replyText);
    }

    const action = option[0];
    let targetPath;
    let relativePath;

    const isIndex = !isNaN(fullPathOrIndex) && parseInt(fullPathOrIndex) > 0;
    if (isIndex && parseInt(fullPathOrIndex) <= listCmd.length) {
        const index = parseInt(fullPathOrIndex) - 1;
        relativePath = listCmd[index];
        targetPath = path.join(pluginFolder, relativePath);
    } else {
        relativePath = fullPathOrIndex.endsWith('.js') ? fullPathOrIndex : fullPathOrIndex + '.js';
        targetPath = path.join(pluginFolder, relativePath);
    }

    try {
        switch (action) {
            case '+': {
                if (!m.quoted) return safeReply(m, "Balas pesan berisi kode untuk disimpan.");
                let code = m.quoted.text || (m.quoted.isMedia ? (await m.quoted.download()).toString('utf-8') : '');
                
                if (!code.trim()) return safeReply(m, "Kode tidak ditemukan.");

                const dir = path.dirname(targetPath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

                const beautifiedCode = js_beautify(code);
                fs.writeFileSync(targetPath, beautifiedCode);

                return safeReply(m, `Plugin berhasil disimpan ke \`${relativePath}\`.\nHot-reload aktif.`);
            }

            case '-': {
                if (!fs.existsSync(targetPath)) return safeReply(m, `Plugin \`${relativePath}\` tidak ada.`);
                fs.unlinkSync(targetPath);
                return safeReply(m, `Plugin \`${relativePath}\` berhasil dihapus.`);
            }

            case '?': {
                if (!fs.existsSync(targetPath)) return safeReply(m, `Plugin \`${relativePath}\` tidak ada.`);
                const content = fs.readFileSync(targetPath, 'utf8');
                return safeReply(m, content);
            }
        }
    } catch (e) {
        console.error(e);
        return safeReply(m, `Terjadi kesalahan: ${e.message}`);
    }
};

handler.help = ['plugin'];
handler.tags = ['owner'];
handler.command = /^(plugin|plugins)$/i;
handler.owner = true;

export default handler;