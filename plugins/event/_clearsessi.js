import fs from 'fs'
import path from 'path'

export async function all(m) {
    let setting = global.db.data.settings[this.user.jid]

    if (setting.clearsession === undefined) setting.clearsession = true

    if (setting.clearsession) {
        if (new Date() - (setting.lastClearSession || 0) > 60 * 60 * 1000) {
            try {
                const sessionDir = './sessions'
                if (!fs.existsSync(sessionDir)) return !0
                
                const files = fs.readdirSync(sessionDir)
                let deletedCount = 0

                for (const file of files) {

                    if (file !== 'creds.json') {
                        fs.unlinkSync(path.join(sessionDir, file))
                        deletedCount++
                    }
                }

                if (deletedCount > 0) {
                    console.log(`[ValL Assistant] Auto Clear: ${deletedCount} file sampah dihapus.`)
                }

                setting.lastClearSession = new Date() * 1
            } catch (e) {
                console.error(e)
            }
        }
    }
    return !0
}