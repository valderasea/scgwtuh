let handler = async (m, { conn }) => {
  const groupId = m.chat;

  if (!global.db.data.groups) global.db.data.groups = {};
  
  global.db.data.groups[groupId] = {
    stats: {},
    hourlyStats: {},
    statsSince: Date.now()
  };

  await m.react("✅");
  
  await m.reply(
    `> *RESET STATS BERHASIL*\n\n` +
    ` • Status: Semua data chat dihapus\n` +
    ` • Info: Tracking dimulai dari nol\n\n` +
    `> Data .topchat akan kosong sampai ada pesan masuk baru.`
  );
};

handler.help = ["resetstats"];
handler.tags = ["group"];
handler.command = /^(resetgroupstats|resetstats)$/i;
handler.group = true;
handler.admin = true;

export default handler;