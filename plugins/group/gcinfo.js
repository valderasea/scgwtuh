let handler = async (m, { conn }) => {
    // Tarik metadata langsung dari server biar gak perlu "groupUp"
    let groupMeta = await conn.groupMetadata(m.chat).catch(e => null)
    if (!groupMeta) return m.reply("Gagal mengambil data grup.")

    const participants = groupMeta.participants || []
    const groupAdmins = participants.filter(p => p.admin)
    const owner = groupMeta.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'

    const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n')

    const ephemeralTime = {
        86400: "24 Jam",
        604800: "7 Hari",
        7776000: "90 Hari"
    }[groupMeta.ephemeralDuration] || "Mati"

    const creationDate = groupMeta.creation ? new Date(groupMeta.creation * 1000).toLocaleString('id-ID') : "(unknown)"

    let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null)
    
    const text = `
『 *GROUP INFORMATION* 』

▢ *Nama:* ${groupMeta.subject}
▢ *ID:* ${m.chat}
▢ *Total Member:* ${participants.length}
▢ *Owner:* @${owner.split('@')[0]}
▢ *Dibuat:* ${creationDate}
▢ *Pesan Sementara:* ${ephemeralTime}
▢ *Hanya Admin:* ${groupMeta.announce ? 'Iya' : 'Tidak'}

*Daftar Admin:*
${listAdmin}

*Deskripsi:*
${groupMeta.desc || '(Tanpa Deskripsi)'}
`.trim()

    await conn.sendMessage(m.chat, {
        [pp ? 'image' : 'text']: pp ? { url: pp } : text,
        caption: pp ? text : undefined,
        mentions: [...groupAdmins.map(v => v.id), owner]
    }, { quoted: m })
}

handler.help = ['groupinfo']
handler.tags = ['group']
handler.command = /^(groupinfo|infogc|gcinfo)$/i
handler.group = true

export default handler