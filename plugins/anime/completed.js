import axios from "axios";

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const apiUrl = "https://api.dyysilence.biz.id/api";
  const page = parseInt(args[0]) || 1;

  await m.react("⏳");

  try {
    const { data } = await axios.get(`${apiUrl}/anime/completed`, {
      params: { page },
      timeout: 30000,
    });

    if (!data?.status) throw new Error(data?.error || "Gagal mengambil data dari server");
    if (!data.results?.length) return m.reply(`> Tidak ada anime completed di halaman ${page}.`);

    let text = `> *ANIME COMPLETED — HALAMAN ${page}*\n\n`;
    
    data.results.forEach((a, i) => {
      text += `> ${i + 1}. *${a.title}*\n`;
      text += ` • Eps: ${a.eps || "-"} | Type: ${a.type || "Anime"}\n`;
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

handler.help = ["completed <halaman>"];
handler.tags = ["anime"];
handler.command = /^(animecompleted|completed)$/i;

export default handler;