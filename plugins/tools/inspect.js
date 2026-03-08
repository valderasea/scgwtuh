let handler = async (m, { conn, text, usedPrefix, command }) => {
    let input = text ? text.trim() : ''

    if (!input) {
        return m.reply(
            `🔍 *ɪɴsᴘᴇᴄᴛ*\n\n` +
            `> Cek info grup atau saluran via link\n\n` +
            `*ᴄᴏɴᴛᴏʜ:*\n` +
            `> \`${usedPrefix + command} https://chat.whatsapp.com/xxx\`\n` +
            `> \`${usedPrefix + command} https://whatsapp.com/channel/xxx\``
        )
    }

    const grupPattern = /chat\.whatsapp\.com\/([\w\d]*)/
    const saluranPattern = /whatsapp\.com\/channel\/([\w\d]*)/

    m.react('🔍')

    try {
        if (grupPattern.test(input)) {
            const inviteCode = input.match(grupPattern)[1]
            
            // Menggunakan groupGetInviteInfo bawaan Baileys
            const groupInfo = await conn.groupGetInviteInfo(inviteCode)
            
            let teks = 
                `📋 *ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ ɢʀᴏᴜᴘ*\n\n` +
                `╭┈┈⬡「 📊 *ᴅᴇᴛᴀɪʟ* 」\n` +
                `┃ 📝 ɴᴀᴍᴇ: *${groupInfo.subject}*\n` +
                `┃ 🆔 ɪᴅ: \`${groupInfo.id}\`\n` +
                `┃ 📅 ᴄʀᴇᴀᴛᴇᴅ: ${new Date(groupInfo.creation * 1000).toLocaleString('id-ID')}\n`

            if (groupInfo.owner) {
                teks += `┃ 👑 ᴄʀᴇᴀᴛᴏʀ: @${groupInfo.owner.split('@')[0]}\n`
            }

            teks += 
                `┃ 🔗 ʟɪɴᴋᴇᴅ ᴘᴀʀᴇɴᴛ: ${groupInfo.linkedParent || 'None'}\n` +
                `┃ 🔒 ʀᴇsᴛʀɪᴄᴛ: ${groupInfo.restrict ? '✅' : '❌'}\n` +
                `┃ 📢 ᴀɴɴᴏᴜɴᴄᴇ: ${groupInfo.announce ? '✅' : '❌'}\n` +
                `┃ 🏘️ ɪs ᴄᴏᴍᴍᴜɴɪᴛʏ: ${groupInfo.isCommunity ? '✅' : '❌'}\n` +
                `┃ 📣 ᴄᴏᴍᴍᴜɴɪᴛʏ ᴀɴɴᴏᴜɴᴄᴇ: ${groupInfo.isCommunityAnnounce ? '✅' : '❌'}\n` +
                `┃ ✅ ᴊᴏɪɴ ᴀᴘᴘʀᴏᴠᴀʟ: ${groupInfo.joinApprovalMode ? '✅' : '❌'}\n` +
                `┃ ➕ ᴍᴇᴍʙᴇʀ ᴀᴅᴅ ᴍᴏᴅᴇ: ${groupInfo.memberAddMode ? '✅' : '❌'}\n` +
                `┃ 👥 ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛs: ${groupInfo.participants?.length || 0}\n` +
                `╰┈┈⬡\n\n`

            if (groupInfo.desc) {
                teks += `📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ:*\n${groupInfo.desc}\n\n`
            }

            const mentions = []
            if (groupInfo.owner) mentions.push(groupInfo.owner)

            if (groupInfo.participants?.length > 0) {
                const admins = groupInfo.participants.filter(p => p.admin)
                if (admins.length > 0) {
                    teks += `👑 *ᴀᴅᴍɪɴs:*\n`
                    admins.forEach(a => {
                        teks += `├ @${a.id.split('@')[0]} [${a.admin}]\n`
                        mentions.push(a.id)
                    })
                    teks += `╰┈┈⬡`
                }
            }

            m.react('✅')
            return conn.sendMessage(m.chat, { text: teks, mentions }, { quoted: m })

        } else if (saluranPattern.test(input) || input.endsWith('@newsletter')) {
            const channelId = saluranPattern.test(input) ? input.match(saluranPattern)[1] : input
            
            // Baileys terkadang butuh metadata newsletter lewat newsletterMsg atau query
            // Catatan: Pastikan library Baileys lo versi terbaru untuk support Newsletter/Saluran
            const channelInfo = await conn.newsletterMetadata('invite', channelId).catch(async () => {
                return await conn.newsletterMetadata('id', channelId)
            })
            
            const teks = 
                `📺 *ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ ᴄʜᴀɴɴᴇʟ*\n\n` +
                `╭┈┈⬡「 📊 *ᴅᴇᴛᴀɪʟ* 」\n` +
                `┃ 🆔 ɪᴅ: \`${channelInfo.id}\`\n` +
                `┃ 📌 sᴛᴀᴛᴇ: ${channelInfo.state || '-'}\n` +
                `┃ 📝 ɴᴀᴍᴇ: *${channelInfo.name || '-'}*\n` +
                `┃ 📅 ᴄʀᴇᴀᴛᴇᴅ: ${channelInfo.creation_time ? new Date(channelInfo.creation_time * 1000).toLocaleString('id-ID') : '-'}\n` +
                `┃ 👥 sᴜʙsᴄʀɪʙᴇʀs: ${channelInfo.subscribers || 0}\n` +
                `┃ ✅ ᴠᴇʀɪꜰɪᴄᴀᴛɪᴏɴ: ${channelInfo.verification || '-'}\n` +
                `╰┈┈⬡\n\n` +
                `📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ:*\n${channelInfo.description || 'No description'}`

            m.react('✅')
            return m.reply(teks)

        } else {
            return m.reply('❌ Hanya support URL Grup atau Saluran WhatsApp!')
        }

    } catch (error) {
        console.error(error)
        m.react('❌')
        
        let msg = error.message
        if (error.data === 400 || error.data === 406) msg = 'Grup/Saluran tidak ditemukan!'
        if (error.data === 401) msg = 'Bot tidak diizinkan mengakses info ini!'
        if (error.data === 410) msg = 'URL grup telah di-reset!'
        
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ${msg}`)
    }
}

handler.help = ['inspect']
handler.tags = ['tools']
handler.command = /^(inspect|cekgrup|ceksaluran|groupinfo|channelinfo)$/i

export default handler