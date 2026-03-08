import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const apiUrl = "https://api.dyysilence.biz.id/api";

  if (!text?.trim()) {
    return m.reply(
      `> *ANIME DETAIL*\n` +
      `\n` +
      `Cara Pakai:\n` +
      `\`${usedPrefix + command} <url series>\``
    );
  }

  if (!text.includes("oploverz")) {
    return m.reply(`> Gunakan URL dari oploverz.ch`);
  }

  await m.react("⏳");

  try {
    const { data } = await axios.get(`${apiUrl}/anime/detail`, {
      params: { url: text.trim() },
      timeout: 30000,
    });

    if (!data?.status) throw new Error(data?.error || "Gagal mengambil data");

    const info = Object.entries(data.info || {})
      .map(([k, v]) => ` • ${k}: ${v}`)
      .join("\n");

    const genres = data.genres?.join(", ") || "-";

    const eps = data.episodes?.slice(0, 10)
      .map((e, i) => ` ${i + 1}. Ep ${e.num} — ${e.name || "-"} (${e.date || "-"})`)
      .join("\n");

    let result =
      `> *${data.title.toUpperCase()}*\n\n` +
      `*Sinopsis:*\n${data.synopsis || "-"}\n\n` +
      `*Info:*\n${info || " • -"}\n\n` +
      `*Genre:* ${genres}\n\n` +
      `> *LIST EPISODE (${data.episodeCount} TOTAL)*\n\n${eps || " • -"}`;

    if (data.episodeCount > 10) result += `\n ... dan ${data.episodeCount - 10} episode lainnya`;

    await m.reply(result.trim());
    await m.react("✅");

  } catch (e) {
    console.error(e);
    await m.react("❌");
    m.reply(`Error: ${e.message}`);
  }
};

handler.help = ["animedetail <url>"];
handler.tags = ["anime"];
handler.command = /^(animedetail|adetail)$/i;

export default handler;