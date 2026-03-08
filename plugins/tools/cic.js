let vall = async (m, { conn, args, usedPrefix, command }) => {
    try {
        let text = args[0] || ""
        if (!text.includes('whatsapp.com/channel/')) {
            return m.reply(`Linknya mana cik?\nContoh: *${usedPrefix + command}* https://whatsapp.com/channel/xxx`)
        }

        if (m.react) await m.react('🔍')

        // Ambil invite code dari link
        const inviteCode = text.split('whatsapp.com/channel/')[1].split('/')[0]
        
        // Ambil metadata via invite code
        const ch = await conn.newsletterMetadata("invite", inviteCode)
        const metadata = ch.thread_metadata

        const caption = `〆 ━━━━━[ *METADATA CH* ]━━━━━〆
     
々 *Nama:* ${metadata?.name?.text || "Gak ada nama"}
々 *ID:* ${ch.id}
々 *Status:* ${ch.state?.type || "Unknown"}
々 *Followers:* ${metadata?.subscribers_count || "0"}
々 *Verifikasi:* ${metadata?.verification === 'VERIFIED' ? 'Verified ✅' : 'None ❌'}

〆 ━━━━━━━━━━━━━━━━━━━〆`

        const buttons = [{
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
                display_text: "Salin ID Channel",
                copy_code: ch.id,
            }),
        }]

        await conn.sendButton(m.chat, {
            image: {
                url: "https://mmg.whatsapp.net" + (metadata.preview?.direct_path || "")
            },
            caption,
            footer: 'Asikin aja cik • ValL Assistant',
            buttons
        }, {
            quoted: m
        })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        m.reply("❌ Error cik, mungkin link salah atau lo lagi kena limit.")
    }
}

vall.help = ["cekidch"]
vall.tags = ["info"]
vall.command = /^(cic|cekidch)$/i

export default vall