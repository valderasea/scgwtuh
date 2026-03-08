import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { Octokit } from '@octokit/rest';

let handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) return;

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!/zip/.test(mime)) return m.reply("> Mana file zip-nya? Reply filenya terus ketik `.upgh nama-repo`");
  if (!text) return m.reply("> Kasih nama reponya mau apa? Contoh: `.upgh my-bot-sc`");

  const GH_TOKEN = global.GH_TOKEN
  const GH_USER = global.GH_USER

  await m.react("⏳");
  const octokit = new Octokit({ auth: GH_TOKEN });
  const tmpDir = path.join(process.cwd(), 'tmp', `gh-${Date.now()}`);

  try {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    let buffer = await q.download();
    const zip = new AdmZip(buffer);
    const extractedDir = path.join(tmpDir, 'extracted');
    zip.extractAllTo(extractedDir, true);

    await octokit.repos.createForAuthenticatedUser({
      name: text,
      private: false,
    });

    const uploadFiles = async (dirPath, repoPath = '') => {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const relPath = path.join(repoPath, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
          await uploadFiles(fullPath, relPath);
        } else {
          const content = fs.readFileSync(fullPath, { encoding: 'base64' });
          await octokit.repos.createOrUpdateFileContents({
            owner: GH_USER,
            repo: text,
            path: relPath,
            message: `Upload ${file} from Bot`,
            content: content,
          });
        }
      }
    };

    await uploadFiles(extractedDir);

    await m.react("✅");
    m.reply(`> ✅ *BERHASIL UPLOAD KE GITHUB*\n\n • Repo: https://github.com/${GH_USER}/${text}\n • Status: File terekstrak via Octokit`);

  } catch (e) {
    console.error(e);
    await m.react("❌");
    m.reply(`> ❌ *GAGAL*\n • Error: ${e.message}`);
  } finally {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
  }
};

handler.help = ['upgh'];
handler.tags = ['owner'];
handler.command = /^upgh$/i;
handler.owner = true;

export default handler;