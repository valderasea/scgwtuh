const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Contoh:\n${usedPrefix + command} 7045035697\n\nMasukin UID player Free Fire!`);

    try {
        const uid = text.trim();
        const res = await fetch(`https://api.nexray.web.id/stalker/freefire?uid=${uid}`);
        const json = await res.json();

        if (!json.status || !json.result || !json.result.name) {
            return m.reply("Player ga ditemukan cuy! Coba UID lain atau cek spellingnya.");
        }

        const data = json.result;

        const stats = `
*STALK FREE FIRE - ${data.name.toUpperCase()} 🔥*

📱 UID: ${data.uid}
🏆 Rank: ${data.br_rank || 'N/A'} (${data.br_rank_point || 'N/A'} pts)
📊 Level: ${data.level || 'N/A'}
⚔️ Kills: ${data.kills || 'N/A'}
💀 Deaths: ${data.deaths || 'N/A'}
🔥 KD Ratio: ${data.kd || 'N/A'}
👥 Guild: ${data.guild_name || 'N/A'} (Level ${data.guild_level || 'N/A'})
🌍 Region: ${data.region || 'N/A'}
📅 Created: ${data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID') : 'N/A'}
📅 Last Login: ${data.last_login ? new Date(data.last_login).toLocaleString('id-ID') : 'N/A'}
❤️ Likes: ${data.likes || 'N/A'}
📝 Signature: ${data.signature || 'N/A'}

Guild Leader:
- Name: ${data.guild_leader_name || 'N/A'}
- UID: ${data.guild_leader_uid || 'N/A'}
- Level: ${data.guild_leader_level || 'N/A'}
        `;

        await m.reply(stats);
    } catch (e) {
        console.error("Error FF stalk Nexray:", e.message);
        m.reply("Error stalk player cuy! API lagi down atau UID salah. ( akun lu bot kali😂)");
    }
};

handler.help = ['ffstalk <UID>'];
handler.tags = ['stalk', 'game'];
handler.command = /^(ffstalk|ffid|ffplayer|ffstats)$/i;

export default handler;