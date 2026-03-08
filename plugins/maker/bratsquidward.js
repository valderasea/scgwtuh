import { createCanvas, loadImage } from "canvas";
import sticker from "../../lib/sticker.js";

const wrapText = (context, text, maxWidth) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = context.measureText(currentLine + " " + word).width;

        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }

    lines.push(currentLine);
    return lines;
};

let handler = async (m, { conn, text }) => {
    try {
        if (!text) return m.reply("Masukkan teks!");

        if (m.react) await m.react('⏳');

        const bgUrl = "https://c.termai.cc/i172/LpJ.jpeg";
        const image = await loadImage(bgUrl);

        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const centerX = 370;
        const centerY = 370;
        const maxWidth = 230;
        const maxHeight = 110;

        let fontSize = 50;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000000";

        let lines = [];

        do {
            ctx.font = `bold ${fontSize}px Sans`;
            lines = wrapText(ctx, text, maxWidth);

            const totalHeight = lines.length * (fontSize * 1.2);
            let exceedsWidth = false;

            for (const line of lines) {
                if (ctx.measureText(line).width > maxWidth) {
                    exceedsWidth = true;
                    break;
                }
            }

            if (totalHeight <= maxHeight && !exceedsWidth) break;

            fontSize--;
        } while (fontSize > 10);

        const lineHeight = fontSize * 1.1;
        const totalHeight = lines.length * lineHeight;
        let startY = centerY - totalHeight / 2 + lineHeight / 2;

        for (const line of lines) {
            ctx.fillText(line, centerX, startY);
            startY += lineHeight;
        }

        const buffer = canvas.toBuffer("image/png");

        let metadata = {
            packName: "ValL-Assistant",
            packPublish: "Brat Squidward"
        };

        let stiker = await sticker.writeExif({ 
            data: buffer, 
            mimetype: 'image/png' 
        }, metadata);

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m });
            if (m.react) await m.react('✅');
        }

    } catch (e) {
        console.error(e);
        if (m.react) await m.react('❌');
        m.reply(String(e.message || e));
    }
};

handler.help = ["bratsquidward <teks>"];
handler.tags = ["maker"];
handler.command = /^(bratsquidward2|squidward)$/i;

export default handler;