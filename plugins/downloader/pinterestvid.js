import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const apiUrl = "https://api.dyysilence.biz.id/api";

  if (!text?.trim()) {
    return m.reply(
      `> *PINTEREST VIDEO DOWNLOADER*\n` +
      `\n` +
      `Cara Pakai:\n` +
      `\`${usedPrefix + command} <url>\``
    );
  }

  const pinPattern = /pin\.it\/[a-zA-Z0-9]+|pinterest\.[a-z]+\/pin\/[0-9]+/i;
  if (!pinPattern.test(text)) {
    return m.reply(`> URL harus dari pinterest.com atau pin.it`);
  }

  await m.react("⏳");

  try {
    const { data } = await axios.get(`${apiUrl}/downloader/pinterestvideo`, {
      params: { url: text.trim() },
      timeout: 30000,
    });

    if (!data?.status) throw new Error(data?.error || "Gagal mengambil data");
    if (!data.videos?.length) throw new Error("Pin ini tidak mengandung video");

    const best = data.videos[0];
    const url = best.url;

    if (!url) throw new Error("URL video tidak ditemukan");

    let caption = `> *PINTEREST VIDEO*\n\n`;
    caption += ` • Judul: ${data.title || "-"}\n`;
    caption += ` • User: ${data.username || "-"}\n`;
    if (best.quality) caption += ` • Kualitas: ${best.quality}\n`;
    if (best.size) caption += ` • Ukuran: ${best.size}\n`;
    caption += ` • Status: Berhasil`;

    await conn.sendMessage(m.chat, { 
      video: { url }, 
      caption, 
      mimetype: "video/mp4" 
    }, { quoted: m });

    await m.react("✅");

  } catch (e) {
    console.error(e);
    await m.react("❌");
    m.reply(`Error: ${e.message}`);
  }
};

handler.help = ["pinterestvid <url>"];
handler.tags = ["downloader"];
handler.command = /^(pinterestvid|pinvid)$/i;

export default handler;