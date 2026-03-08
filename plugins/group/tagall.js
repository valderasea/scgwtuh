let handler = async (m, { conn, text, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply("Ini buat grup doang.")
  if (!(isAdmin || isOwner)) return m.reply("Admin aja. Jangan sok ngatur grup orang.")

  const meta = await conn.groupMetadata(m.chat)
  const members = meta.participants.map(p => p.id)

  const reason = text?.trim()
  const head = reason ? `📢 *TAG ALL*\n${reason}\n` : "📢 *TAG ALL*\n"
  const lines = members.map((jid, i) => `${i + 1}. @${jid.split("@")[0]}`).join("\n")

  await conn.sendMessage(
    m.chat,
    { text: head + "\n" + lines, mentions: members },
    { quoted: m }
  )
}

handler.help = ["tagall [pesan]"]
handler.tags = ["group"]
handler.command = /^(tagall|all|everyone)$/i
handler.group = true
handler.admin = true

export default handler