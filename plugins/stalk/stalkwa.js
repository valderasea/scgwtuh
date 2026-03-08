let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    try {
        const flag = args[0]?.toLowerCase();
        const input = m.mentionedJid?.[0] || m.quoted?.sender || (text && /^\d+$/.test(text) ? text + "@s.whatsapp.net" : null);

        if (flag !== "-g" && flag !== "-c" && !input) {
            return m.reply(
                `*WhatsApp Stalker - ValL Assistant*\n\n` +
                `*Cara Pakai:*\n` +
                `│ • ${usedPrefix + command} 628xxx (Nomor)\n` +
                `│ • ${usedPrefix + command} @tag\n` +
                `│ • ${usedPrefix + command} (Reply pesan)\n` +
                `│ • ${usedPrefix + command} -g (Info grup ini)\n` +
                `│ • ${usedPrefix + command} -g <link grup>\n` +
                `│ • ${usedPrefix + command} -c <link channel>`
            );
        }

        if (flag === "-g") return await getGroupInfo(m, conn, args.slice(1).join(" "));
        if (flag === "-c") return await getChannelInfo(m, conn, args.slice(1).join(" "));

        await getUserInfo(m, conn, input);

    } catch (e) {
        console.error(e);
        m.reply(`Error: ${e.message}`);
    }
};

async function getUserInfo(m, conn, input) {
    const lid = input.endsWith("@lid") ? input : await conn.signalRepository.lidMapping.getLIDForPN(input);
    if (!lid) return m.reply("LID user nggak ketemu cik.");

    const jid = await conn.signalRepository.lidMapping.getPNForLID(lid);
    const [exists] = await conn.onWhatsApp(jid || input);
    if (!exists?.exists) return m.reply("Nomor nggak terdaftar di WA.");

    const pp = await conn.profilePictureUrl(input, "image").catch(() => "https://qu.ax/jVZhH.jpg");
    const status = await conn.fetchStatus(input).catch(() => null);
    const biz = await conn.getBusinessProfile(input).catch(() => null);

    let cap = `*WhatsApp Profile - ValL Assistant*\n\n`;
    cap += `┌─ 「 *USER INFO* 」\n`;
    cap += `│ ◈ *User:* @${lid.split("@")[0]}\n`;
    cap += `│ ◈ *Status:* ${status?.[0]?.status || "_Gak ada status_"}\n`;
    cap += `│ ◈ *JID:* \`${conn.decodeJid(input)}\`\n`;
    cap += `└────────────\n`;

    if (biz) {
        cap += `\n┌─ 「 *BUSINESS INFO* 」\n`;
        cap += `│ ◈ *Category:* ${biz.category || "-"}\n`;
        cap += `│ ◈ *Email:* ${biz.email || "-"}\n`;
        cap += `│ ◈ *Desc:* ${biz.description || "-"}\n`;
        cap += `└────────────\n`;
    }

    await conn.sendMessage(m.chat, { image: { url: pp }, caption: cap.trim(), mentions: [lid] }, { quoted: m });
}

async function getGroupInfo(m, conn, arg) {
    let meta, gid;
    if (arg.includes("chat.whatsapp.com/")) {
        const code = arg.split("chat.whatsapp.com/")[1];
        meta = await conn.groupGetInviteInfo(code);
        gid = meta.id;
    } else {
        if (!m.isGroup) return m.reply("Harus di grup atau pake link cik!");
        gid = m.chat;
        meta = await conn.groupMetadata(gid);
    }

    const pp = await conn.profilePictureUrl(gid, "image").catch(() => null);
    let cap = `*Group Stalker - ValL Assistant*\n\n`;
    cap += `│ ◈ *Nama:* ${meta.subject}\n`;
    cap += `│ ◈ *ID:* \`${meta.id}\`\n`;
    cap += `│ ◈ *Member:* ${meta.participants.length}\n`;
    cap += `│ ◈ *Owner:* @${(meta.subjectOwner || "").split("@")[0]}\n`;
    cap += `└────────────`;

    if (pp) await conn.sendMessage(m.chat, { image: { url: pp }, caption: cap }, { quoted: m });
    else m.reply(cap);
}

async function getChannelInfo(m, conn, arg) {
    if (!arg.includes("whatsapp.com/channel/")) return m.reply("Link channel mana cik?");
    const code = arg.split("channel/")[1];
    const meta = await conn.newsletterMetadata("invite", code, "GUEST");
    const trd = meta.thread_metadata;

    let cap = `*Channel Stalker - ValL Assistant*\n\n`;
    cap += `│ ◈ *Nama:* ${trd.name.text}\n`;
    cap += `│ ◈ *Subscribers:* ${trd.subscribers_count || 0}\n`;
    cap += `│ ◈ *Verification:* ${trd.verification}\n`;
    cap += `└────────────`;

    m.reply(cap);
}

handler.help = ["stalkwa"];
handler.tags = ["stalk"];
handler.command = /^(stalkwa)$/i;

export default handler;