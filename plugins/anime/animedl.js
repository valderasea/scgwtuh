import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const apiUrl = "https://api.dyysilence.biz.id/api";

  if (!text?.trim()) {
    return m.reply(
      `> 📥 *ANIME DOWNLOAD*\n>\n` +
      `> 📝 *Cara Pakai:*\n` +
      `> \`${usedPrefix + command} <url episode>\`\n`
    );
  }

  await m.react("⏳");

  try {
    const { data } = await axios.get(`${apiUrl}/anime/download`, {
      params: { url: text.trim(), bypass: true },
      timeout: 60000,
    });

    if (!data?.status) throw new Error(data?.error || "Gagal mengambil data");

    let result = `> 📥 *${data.title}*\n>\n`;
    let hasContent = false;

    if (data.table && Object.keys(data.table).length > 0) {
      hasContent = true;
      result += `> *Link Download:*\n`;
      for (const [quality, servers] of Object.entries(data.table)) {
        result += `>\n> 📦 *${quality}*\n`;
        for (const [server, link] of Object.entries(servers)) {
          result += `>    • ${server}: ${link}\n`;
        }
      }
    }

    if (data.direct && Object.keys(data.direct).length > 0) {
      hasContent = true;
      result += `> 🔗 *Direct Links:*\n`;
      for (const [label, link] of Object.entries(data.direct)) {
        result += `>    • ${label}: ${link}\n`;
      }
    }


    if (data.gofile && Object.keys(data.gofile).length > 0) {
      hasContent = true;
      result += `>\n> ⚡ *Gofile Direct (Bypass):*\n`;
      for (const [glink, gdata] of Object.entries(data.gofile)) {
        if (gdata.error) continue;
        result += `>    📁 Folder: ${gdata.folderName}\n`;
        if (Array.isArray(gdata.files)) {
          gdata.files.forEach((f) => {
            result += `>    • ${f.name} (${f.size})\n`;
            result += `>      🔗 ${f.link}\n`;
          });
        }
      }
    }

    if (!hasContent) {
      result += `> ❌ Tidak ditemukan link download aktif.\n> Silakan coba gunakan link episode lain.`;
    }

    await m.reply(result.trim());
    await m.react("✅");

  } catch (e) {
    console.error(e);
    await m.react("❌");
    m.reply(`❌ Error: ${e.message}`);
  }
};

handler.help = ["anidl <url>"];
handler.tags = ["anime"];
handler.command = /^(anidl|animedownload)$/i;

export default handler;