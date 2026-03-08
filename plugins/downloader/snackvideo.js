import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const apiUrl = "https://api.dyysilence.biz.id/api";

  if (!text?.trim()) {
    return m.reply(
      `> *SNACKVIDEO DOWNLOADER*\n` +
      `\n` +
      `Cara Pakai:\n` +
      `\`${usedPrefix + command} <url>\``
    );
  }

  if (!text.includes("snackvideo.com")) {
    return m.reply(`> URL harus dari snackvideo.com`);
  }

  await m.react("⏳");

  try {
    const { data } = await axios.get(`${apiUrl}/downloader/snackvideo`, {
      params: { url: text.trim() },
      timeout: 60000,
    });

    if (!data?.status) throw new Error(data?.error || "Gagal mengambil data video");
    if (!data.videoUrl) throw new Error("URL video tidak ditemukan");

    const { title, duration, uploadDate, stats, creator } = data;

    let caption = `> *SNACKVIDEO DOWNLOAD*\n\n`;
    caption += ` • Judul: ${title || "-"}\n`;
    caption += ` • Creator: ${creator?.name || "-"}\n`;
    caption += ` • Durasi: ${duration || "-"}\n`;
    caption += ` • Upload: ${uploadDate || "-"}\n`;
    caption += ` • Views: ${stats?.views?.toLocaleString("id-ID") || "0"}\n`;
    caption += ` • Status: Berhasil`;

    await conn.sendMessage(m.chat, { 
      video: { url: data.videoUrl }, 
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

handler.help = ["snackvideo <url>"];
handler.tags = ["downloader"];
handler.command = /^(snackvideo|snackvid|snack)$/i;

export default handler;