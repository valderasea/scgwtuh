import fs from "fs"
import path from "path"

const DB_PATH = "./database/limit-grup.json"
const ONE_HOUR = 60 * 60 * 1000

function readDB() {
    try {
        if (!fs.existsSync(DB_PATH)) return {}
        return JSON.parse(fs.readFileSync(DB_PATH, "utf8"))
    } catch {
        return {}
    }
}

function writeDB(db) {
    fs.mkdirSync(path.dirname(DB_PATH), {
        recursive: true
    })
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

function normalizeLimitCfg(cfg) {
    const def = {
        enabled: true,
        limitMax: 20,
        cooldownSec: 30,
        limit: 20,
        lastReset: Date.now(),
        lastUsed: 0
    }

    cfg ||= {}
    if (typeof cfg.enabled !== "boolean") cfg.enabled = def.enabled
    if (!Number.isFinite(cfg.limitMax)) cfg.limitMax = def.limitMax
    if (!Number.isFinite(cfg.cooldownSec)) cfg.cooldownSec = def.cooldownSec

    // limit sekarang
    if (!Number.isFinite(cfg.limit)) cfg.limit = cfg.limitMax

    // reset time tracking
    if (!Number.isFinite(cfg.lastReset)) cfg.lastReset = def.lastReset
    if (!Number.isFinite(cfg.lastUsed)) cfg.lastUsed = def.lastUsed

    return cfg
}

function statusText(cfg) {
    const now = Date.now()
    const minsLeft = Math.max(0, Math.ceil((ONE_HOUR - (now - cfg.lastReset)) / 60000))
    return (
        `*Status Limit Grup*
────────────
Aktif        : ${cfg.enabled ? "✅ ON" : "❌ OFF"}
Limit/jam    : ${cfg.limitMax}
Sisa saat ini: ${cfg.limit}
Cooldown     : ${cfg.cooldownSec}s
Reset dalam  : ${minsLeft} menit`
    )
}

let handler = async (m, {
    conn,
    args,
    usedPrefix,
    command,
    isAdmin,
    isOwner
}) => {
    if (!m.isGroup) return m.reply("Ini khusus grup. Jangan sok DM.")

    // admin grup ATAU owner bot boleh
    if (!(isAdmin || isOwner)) return m.reply("Admin aja. Lu siapa?")

    const sub = (args[0] || "status").toLowerCase()

    const db = readDB()
    const cfg = normalizeLimitCfg(db[m.chat])
    db[m.chat] = cfg

    if (sub === "status" || sub === "info") {
        writeDB(db)
        return m.reply(statusText(cfg))
    }

    if (sub === "on") {
        cfg.enabled = true
        // rapihin biar gak nyisa config aneh
        cfg.limit = Number.isFinite(cfg.limit) ? cfg.limit : cfg.limitMax
        db[m.chat] = cfg
        writeDB(db)
        return m.reply("✅ Limit grup: ON")
    }

    if (sub === "off") {
        cfg.enabled = false
        db[m.chat] = cfg
        writeDB(db)
        return m.reply("❌ Limit grup: OFF")
    }

    if (sub === "reset") {
        cfg.limit = cfg.limitMax
        cfg.lastReset = Date.now()
        cfg.lastUsed = 0
        db[m.chat] = cfg
        writeDB(db)
        return m.reply("✅ Limit grup di-reset.")
    }

    if (sub === "set") {
        // .limitgrup set 30 15
        // => limitMax=30 cooldownSec=15
        const max = parseInt(args[1])
        const cd = parseInt(args[2])

        if (!Number.isFinite(max) || max < 1 || max > 500) {
            return m.reply(`Format: ${usedPrefix + command} set <limitMax 1-500> <cooldownSec 0-300>\nContoh: ${usedPrefix + command} set 30 15`)
        }
        if (!Number.isFinite(cd) || cd < 0 || cd > 300) {
            return m.reply("cooldownSec harus 0-300.")
        }

        cfg.limitMax = max
        cfg.cooldownSec = cd
        if (cfg.limit > max) cfg.limit = max
        db[m.chat] = cfg
        writeDB(db)
        return m.reply(`✅ Diset.\nLimit/jam: ${max}\nCooldown: ${cd}s`)
    }

    if (sub === "clear") {
        delete db[m.chat]
        writeDB(db)
        return m.reply("✅ Config limit grup dihapus (balik default).")
    }

    return m.reply(
        `Pakai:
• ${usedPrefix + command} status
• ${usedPrefix + command} on
• ${usedPrefix + command} off
• ${usedPrefix + command} reset
• ${usedPrefix + command} set <limitMax> <cooldownSec>
• ${usedPrefix + command} clear`
    )
}

handler.help = ["limitgrup"]
handler.tags = ["group"]
handler.command = /^(limitgrup|grouplimit|limitgc)$/i
handler.group = true
handler.admin = true // biar selaras sama sistem dfail lu
export default handler