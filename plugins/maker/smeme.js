import sticker from '../../lib/sticker.js'
import { uploaderUguu } from "../../lib/uploader.js"
import axios from "axios"

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        let quoted = m.quoted ? m.quoted : m;
        let mime = (quoted.msg || quoted).mimetype || "";

        // Validasi input
        if (!/image/.test(mime)) return m.reply(`*– 乂 Cara Pakai Fitur ${usedPrefix + command}*\n\n々 Atas: ${usedPrefix + command} --atas text\n々 Bawah: ${usedPrefix + command} --bawah text\n々 Bersama: ${usedPrefix + command} text atas | text bawah`);

        if (m.react) await m.react('⏳');

        // Proses download & upload media ke uploader
        let media = await quoted.download();
        let link = await uploaderUguu(media);
        
        let t1 = " ", t2 = " ";
        
        // Parsing text buat meme
        if (text.includes("--atas")) {
            t1 = text.replace(/--atas/i, "").trim() || " ";
        } else if (text.includes("--bawah")) {
            t2 = text.replace(/--bawah/i, "").trim() || " ";
        } else if (text.includes("|")) {
            let [p1, p2] = text.split("|").map(v => v.trim());
            t1 = p1 || " ";
            t2 = p2 || " ";
        } else {
            t1 = text.trim() || " ";
        }

        if (t1 === " " && t2 === " ") return m.reply("⚠️ Masukan teksnya dulu kampang!");

        // Nembak API Meme Maker
        const api = `https://api.nexray.web.id/maker/smeme?text_atas=${encodeURIComponent(t1)}&text_bawah=${encodeURIComponent(t2)}&background=${encodeURIComponent(link)}`;
        
        const response = await axios.get(api, { responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data);

        let metadata = {
            packName: global.packname || "Meme Sticker",
            packPublish: global.author || "ValL-Assistant"
        };

        let stiker = await sticker.writeExif({ 
            data: buffer, 
            mimetype: 'image/png'
        }, metadata);

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m });
            if (m.react) await m.react('✅');
        } else {
            throw new Error("Gagal konversi meme ke stiker");
        }

    } catch (e) {
        console.error(e);
        if (m.react) await m.react('❌');
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ["smeme"];
handler.tags = ["maker"];
handler.command = ["smeme"];

export default handler;