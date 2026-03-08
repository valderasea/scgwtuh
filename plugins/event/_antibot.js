let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return !0
    if (!isBotAdmin) return !0
    if (m.isBaileys && !m.fromMe) {
        if (isAdmin) return !0
        
        await m.reply('🛡️ *Anti-Bot Detected!*\nMaaf, dilarang membawa bot lain ke grup ini.')
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        return !1
    }
    
    return !0
}

handler.all = async function (m, { conn, isBotAdmin }) {
    if (!m.isGroup || !isBotAdmin) return
    

    if (m.messageStubType === 27 || m.messageStubType === 31) {
        let user = m.messageStubParameters[0]

        if (user.includes('bot') || user.length > 20) {
             console.log(`[ANTIBOT] Deteksi Bot Masuk: ${user}`)
        }
    }
}

export default handler