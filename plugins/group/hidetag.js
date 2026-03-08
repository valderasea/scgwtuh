let handler = async (m, { conn, text }) => {
    let groupMetadata = await conn.groupMetadata(m.chat)
    let participants = groupMetadata.participants
    let users = participants.map(u => u.id)
    
    let q = m.quoted ? m.quoted : m
    let txt = text || q.text || q.caption || ""

    await conn.sendMessage(m.chat, { 
        text: txt, 
        mentions: users 
    }, { quoted: m })
}

handler.help = ["hidetag"]
handler.tags = ["group"]
handler.command = /^(hidetag|h)$/i
handler.group = true
handler.admin = true

export default handler