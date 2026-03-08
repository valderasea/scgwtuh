import fs from "fs";
import { execSync } from "child_process";
import moment from 'moment-timezone';

export async function all(m) {
    let setting = global.db.data.settings[this.user.jid]

    if (setting && setting.backup) {
        if (new Date() - (setting.backupSC || 0) > 24 * 60 * 60 * 1000) { 
            try {
                const tempDir = "./tmp";
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

                const waktu = moment().tz('Asia/Jakarta').format('DD-MM-YYYY');
                const backupName = `Backup_SC_${waktu}`;
                const backupPath = `${tempDir}/${backupName}.zip`;

                const ls = (await execSync("ls"))
                    .toString()
                    .split("\n")
                    .filter(
                        (pe) =>
                            pe !== "node_modules" &&
                            pe !== "sessions" &&
                            pe !== "package-lock.json" &&
                            pe !== "yarn.lock" &&
                            pe !== "pnpm-lock.yaml" &&
                            pe !== "tmp" && 
                            pe !== ""
                    );

                await execSync(`zip -r ${backupPath} ${ls.join(" ")}`);

                const ownerNumber = global.owner[0] + '@s.whatsapp.net'
                const caption = `📦 *Auto Backup Script (Daily)*\n🕒 ${moment().tz('Asia/Jakarta').format('DD MMMM YYYY, HH:mm:ss')} WIB\n\n_ValL Assistant Daily System_`

                await this.sendMessage(
                    ownerNumber,
                    {
                        document: fs.readFileSync(backupPath),
                        fileName: `${backupName}.zip`,
                        mimetype: "application/zip",
                        caption: caption
                    }
                );

                if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
                
                setting.backupSC = new Date() * 1;
                
            } catch (e) {
                console.error(e);
            }
        }
    }
    return !0
}