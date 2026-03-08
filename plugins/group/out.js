let handler = async (m, { conn, usedPrefix, command }) => {

  if (!m.isGroup) return m.reply("> Perintah ini hanya dapat digunakan di dalam grup.");
  
  if (!m.isOwner) return m.reply("> Perintah ini khusus untuk pengembang bot.");

  await m.react("⏳");
  
  await m.reply("> *BOT AKAN KELUAR DARI GRUP INI*\n\nSampai jumpa lagi!");
  
  await conn.groupLeave(m.chat);
  await m.react("✅");
};

handler.help = ["out", "leave"];
handler.tags = ["owner"];
handler.command = /^(out|leave)$/i;
handler.owner = true;

export default handler;