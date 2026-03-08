import { fileTypeFromBuffer } from "file-type";
import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";

async function uploaderUguu(buffer) {
    try {
        const type = await fileTypeFromBuffer(buffer);
        const formData = new FormData();
        const blob = new Blob([buffer], { type: type?.mime || "application/octet-stream" });
        formData.append("files[]", blob, `upload.${type?.ext || "bin"}`);
        const response = await fetch("https://uguu.se/upload.php", {
            method: "POST",
            body: formData,
        });
        const json = await response.json();
        return json.files[0].url.trim();
    } catch { return null }
}

let handler = async (m, { conn, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/image/.test(mime)) return m.reply(`Reply gambarnya cik`)
    if (m.react) await m.react("⏳")
    let buffer = await q.download()
    let url = await uploaderUguu(buffer)
    if (!url) return m.reply("Gagal upload")
    let res = `https://api-faa.my.id/faa/${command}?url=${url}`
    await conn.sendFile(m.chat, res, 'result.jpg', 'Nih jadi', m)
}
handler.help = handler.command = ['tohitam']
handler.tags = ['maker']
export default handler