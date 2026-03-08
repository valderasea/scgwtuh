import fetch from "node-fetch";
import { uploaderUguu } from '../../lib/uploader.js';

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  
  if (!/image/.test(mime)) return m.reply(`> Kirim atau reply gambar dengan caption \`${usedPrefix + command}\``);

  await m.react("⏳");

  try {
    let img = await q.download();
    let { url } = await uploaderUguu(img); 
    let api = `https://kazzz4z.my.id/api/maker/affinitasml?image=${encodeURIComponent(url)}`;
    
    let res = await fetch(api);
    if (!res.ok) throw new Error("Gagal memproses gambar di API.");
    let buffer = await res.buffer();

    await conn.sendMessage(m.chat, { 
      image: buffer, 
      caption: `> *AFFINITAS ML RESULT*` 
    }, { quoted: m });
    
    await m.react("✅");

  } catch (e) {
    console.error(e);
    await m.react("❌");
    m.reply(`> ❌ *GAGAL PROSES GAMBAR*\n • Error: ${e.message}`);
  }
};

handler.help = ["affinitasml"];
handler.tags = ["maker"];
handler.command = /^(affinitasml|affml)$/i;

export default handler;