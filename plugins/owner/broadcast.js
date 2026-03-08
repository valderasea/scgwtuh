let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`> *BROADCAST MANAGER*\n\n • Ke Grup: \`.bcgc <teks>\`\n • Ke PC: \`.bc <teks>\``)

  // Cek kalau command-nya 'bcgc' berarti ke grup, kalau 'bc' ke user
  const isBcGroups = /gc/i.test(command)
  const chats = isBcGroups 
    ? Object.keys(global.db.data.chats).filter(id => id.endsWith('@g.us'))
    : Object.keys(global.db.data.users).filter(id => id.endsWith('@s.whatsapp.net'))

  await m.react("⏳")
  
  let success = 0
  for (let id of chats) {
    try {
      await conn.sendMessage(id, { 
        text: `> *BROADCAST ${isBcGroups ? 'GROUPS' : 'CHATS'}*\n\n${text}` 
      })
      success++
      // Delay 1 detik biar aman dari ban WhatsApp
      await new Promise(resolve => setTimeout(resolve, 1000)) 
    } catch (e) {
      console.error(`Gagal kirim ke ${id}`)
    }
  }

  await m.react("✅")
  m.reply(`> ✅ *BROADCAST SELESAI*\n • Berhasil dikirim ke: ${success} ${isBcGroups ? 'Grup' : 'User'}`)
}

handler.help = ['bc', 'bcgc']
handler.tags = ['owner']
handler.command = /^(bc|bcgc)$/i
handler.owner = true

export default handler