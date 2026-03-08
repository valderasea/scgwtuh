let handler = async (m, { conn, text, isOwner }) => {

    if (!isOwner) return m.reply("⚠️ Hanya owner yang bisa mengubah mode banchat!");
    if (!text) return m.reply("Contoh: .banchat on / .banchat off");

    const value = text.toLowerCase();
    if (!["on", "off"].includes(value)) return m.reply("Gunakan on atau off!");

    // Ambil data chat dari global.db yang udah di-load di main.js
    let chat = global.db.data.chats[m.chat];
    if (!chat) return m.reply("❌ Data grup tidak ditemukan di database!");

    const isBanchat = value === "on";
    chat.isBanned = isBanchat; // Ganti status ban

    m.reply(`✅ Mode banchat telah *${isBanchat ? "AKTIF" : "NONAKTIF"}* untuk grup ini!`);
};

handler.help = ["banchat"];
handler.tags = ["owner"];
handler.command = /^(banchat)$/i;
handler.owner = true;

export default handler;