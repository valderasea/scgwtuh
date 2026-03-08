import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import fetch from 'node-fetch'
import { parentPort } from 'worker_threads'

const REPO_URL = 'https://github.com/valderasea/scgwtuh/archive/refs/heads/main.zip' 

const PRESERVE_ITEMS = [
    'config.js',
    'data',
    'sessions',
    'database', 
    '.env',
    'node_modules'
]

const handler = async (m, { conn }) => {
    const baseDir = process.cwd()
    const tempZip = path.join(baseDir, 'tmp', `update-${Date.now()}.zip`)

    try {
        await m.reply('🔄 *ᴜᴘᴅᴀᴛᴇ sʏsᴛᴇᴍ ᴀᴄᴛɪᴠᴀᴛᴇᴅ*\n\n> Mendownload source code terbaru dari GitHub...')
        if (m.react) await m.react("⏳")

        // 1. Download ZIP
        const res = await fetch(REPO_URL)
        if (!res.ok) throw new Error(`Gagal download: ${res.statusText}`)
        const buffer = Buffer.from(await res.arrayBuffer())
        
        if (!fs.existsSync(path.join(baseDir, 'tmp'))) fs.mkdirSync(path.join(baseDir, 'tmp'))
        fs.writeFileSync(tempZip, buffer)

        const zip = new AdmZip(tempZip)
        const zipEntries = zip.getEntries()
        let count = 0

        // 2. Ekstrak & Timpa file
        zipEntries.forEach(entry => {
            // Hilangkan folder root dari zip GitHub
            const fileName = entry.entryName.split('/').slice(1).join('/')
            if (!fileName || PRESERVE_ITEMS.some(item => fileName.startsWith(item))) return

            const fullPath = path.join(baseDir, fileName)
            
            if (entry.isDirectory) {
                if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true })
            } else {
                const dir = path.dirname(fullPath)
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
                fs.writeFileSync(fullPath, entry.getData())
                count++
            }
        })

        if (m.react) await m.react("✅")
        await m.reply(`✅ *ᴜᴘᴅᴀᴛᴇ sᴜᴄᴄᴇss*\n\n> Berhasil memperbarui ${count} file.\n> Bot akan restart otomatis...`)
        
        if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip)

        setTimeout(() => {
            if (parentPort) {
                parentPort.postMessage('restart')
            } else {
                process.exit(0)
            }
        }, 3000)

    } catch (e) {
        console.error(e)
        if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip)
        m.reply(`❌ *ᴜᴘᴅᴀᴛᴇ ɢᴀɢᴀʟ*\n\n> Error: ${e.message}`)
    }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = /^(update|updatesc)$/i
handler.owner = true

export default handler