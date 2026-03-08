import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const apiUrl = "https://api.dyysilence.biz.id/api";

  if (!text?.trim()) {
    return m.reply(
      `> *PINTEREST DOWNLOADER*\n` +
      `\n` +
      `Cara Pakai:\n` +
      `\`${usedPrefix + command} <url>\``
    );
  }

  const pinPattern = /pinterest\.(com|[a-z]{2,3})|pin\.it/i;
  if (!pinPattern.test(text)) {
    return m.reply(`> URL harus dari pinterest.com atau pin.it`);
  }

  await m.react("⏳");

  try {
    const { data } = await axios.get(`${apiUrl}/downloader/pinterestimage`, {
      params: { url: text.trim() },
      timeout: 30000,
    });

    if (!data?.status) throw new Error(data?.error || "Gagal mengambil data");

    const { type = "image", url, title = "Pinterest Media" } = data;

    if (!url) throw new Error("URL media tidak ditemukan");

    let caption = `> *PINTEREST ${type.toUpperCase()}*\n\n`;
    caption += ` • Judul: ${title}\n`;
    caption += ` • Status: Berhasil`;

    if (type === "video") {
      await conn.sendMessage(m.chat, { 
        video: { url }, 
        caption, 
        mimetype: "video/mp4" 
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, { 
        image: { url }, 
        caption 
      }, { quoted: m });
    }

    await m.react("✅");

  } catch (e) {
    console.error(e);
    await m.react("❌");
    m.reply(`Error: ${e.message}`);
  }
};

handler.help = ["pinterestimg <url>"];
handler.tags = ["downloader"];
handler.command = /^(pinterestimg|pinimg|pin)$/i;

export default handler;