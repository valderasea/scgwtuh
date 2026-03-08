import { Octokit } from '@octokit/rest';

let handler = async (m, { text, isOwner }) => {
  if (!isOwner || !text) return;

  const GH_TOKEN = global.GH_TOKEN
  const GH_USER = global.GH_USER
  const octokit = new Octokit({ auth: GH_TOKEN });

  await m.react("⏳");

  try {
    await octokit.repos.delete({
      owner: GH_USER,
      repo: text.trim(),
    });
    await m.react("✅");
    m.reply(`> ✅ Repo *${text}* udah musnah dari muka bumi.`);
  } catch (e) {
    await m.react("❌");
    m.reply(`> ❌ Gagal hapus. Pastiin nama reponya bener.`);
  }
};

handler.help = ['delgh'];
handler.tags = ['owner'];
handler.command = /^delgh$/i;
handler.owner = true;

export default handler;