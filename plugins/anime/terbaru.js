import axios from "axios";

let handler = async (m, { conn, usedPrefix, command }) => {
  const apiUrl = "https://api.dyysilence.biz.id/api";

  await m.react("⏳");

  try {
    const { data } = await axios.get(`${apiUrl}/anime/terbaru`, {
      timeout: 30000,
    });

    if (!data?.status) throw new Error(data?.error || "Gagal mengambil data dari server");
    if (!data.results?.length) return m.reply(`> Tidak ada episode terbaru ditemukan.`);

    let text = `> *EPISODE ANIME TERBARU*\n\n`;
    
    data.results.forEach((a, i) => {
      text += `> ${i + 1}. *${a.title}*\n`;
      text += ` • Eps: ${a.eps || "-"}\n`;
      text += ` • Link: ${a.link}\n`;
      if (i < data.results.length - 1) text += `\n`;
    });
    
    text += `\n> Total: ${data.total || data.results.length} hasil`;

    await m.reply(text.trim());
    await m.react("✅");

  } catch (e) {
    console.error(e);
    await m.react("❌");
    m.reply(`Error: ${e.message}`);
  }
};

handler.help = ["terbaru"];
handler.tags = ["anime"];
handler.command = /^(animeterbaru|terbaru)$/i;

export default handler;