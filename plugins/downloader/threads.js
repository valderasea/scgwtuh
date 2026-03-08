import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const apiUrl = "https://api.dyysilence.biz.id/api";

  if (!text?.trim()) {
    return m.reply(
      `> *THREADS DOWNLOADER*\n` +
      `\n` +
      `Cara Pakai:\n` +
      `\`${usedPrefix + command} <url>\``
    );
  }

  if (!/threads\.(com|net)\/@[^/]+\/post\/[A-Za-z0-9_-]+/i.test(text)) {
    return m.reply(`> URL tidak valid\nFormat: https://www.threads.com/@user/post/xxx`);
  }

  await m.react("⏳");

  try {
    const { data } = await axios.get(`${apiUrl}/downloader/threads`, {
      params: { url: text.trim() },
      timeout: 45000,
    });

    if (!data?.status) throw new Error(data?.error || "Gagal mengambil media");

    const { author, videos = [], images = [], total } = data;
    const allMedia = [...videos, ...images];

    if (!allMedia.length) throw new Error("Tidak ada media ditemukan");

    const header = `> *THREADS DOWNLOAD*\n\n` +
      ` • Author: @${author || "-"}\n` +
      ` • Total: ${total}\n\n`;

    for (let i = 0; i < allMedia.length; i++) {
      const item = allMedia[i];
      const isLast = i === allMedia.length - 1;
      const caption = i === 0 
        ? header + `Status: Berhasil` 
        : `> Media ${i + 1}/${total}`;

      if (item.type === "video") {
        await conn.sendMessage(m.chat, { 
          video: { url: item.url }, 
          caption, 
          mimetype: "video/mp4" 
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, { 
          image: { url: item.url }, 
          caption 
        }, { quoted: m });
      }

      if (!isLast) await new Promise(r => setTimeout(r, 1500));
    }

    await m.react("✅");

  } catch (e) {
    console.error(e);
    await m.react("❌");
    m.reply(`Error: ${e.message}`);
  }
};

handler.help = ["threads <url>"];
handler.tags = ["downloader"];
handler.command = /^(threads)$/i;

export default handler;