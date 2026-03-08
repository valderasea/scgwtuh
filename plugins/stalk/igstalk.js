import axios from "axios";

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `Gunakan format:\n${usedPrefix + command} username\nContoh: *${usedPrefix + command}* baguselek21`
    );
  }

  if (m.react) await m.react('⏳');

  try {
    const username = text.replace(/^@/, "").trim();
    const apiUrl = `https://api.baguss.xyz/api/stalker/instagram?username=${encodeURIComponent(username)}`;

    const { data } = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!data || !data.status) {
      throw new Error("Data tidak ditemukan");
    }

    let caption = `*INSTAGRAM STALK*\n\n`;
    caption += `*Username:* ${data.username}\n`;
    caption += `*Full Name:* ${data.fullname || "-"}\n`;
    caption += `*Followers:* ${Number(data.followers).toLocaleString()}\n`;
    caption += `*Following:* ${Number(data.following).toLocaleString()}\n`;
    caption += `*Posts:* ${Number(data.posts).toLocaleString()}\n`;
    caption += `*Bio:* ${data.bio || "-"}\n`;

    if (data.profile_pic) {
      await conn.sendMessage(
        m.chat,
        {
          image: { url: data.profile_pic },
          caption
        },
        { quoted: m }
      );
    } else {
      await m.reply(caption);
    }

    if (m.react) await m.react('✅');

  } catch (err) {
    console.error(err);
    if (m.react) await m.react('❌');
    m.reply("Terjadi kesalahan mbut, mungkin akunnya di private atau kagak ada.");
  }
};

handler.help = ['igstalk'];
handler.tags = ['stalk'];
handler.command = /^(igstalk|instagramstalk|stalkig)$/i;

export default handler;