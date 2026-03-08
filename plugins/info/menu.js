import { generateWAMessageFromContent, proto } from "baileys"
import os from "os"
import moment from "moment-timezone"

const THUMB_URL = "https://cdn.yupra.my.id/yp/2hl5a7qv.jpg"
const META = {
    ai: "AI Intelligence",
    downloader: "Downloader",
    group: "Group Management",
    main: "Bot Information",
    anime: "Anime Search",
    maker: "Media Maker",
    rpg: "Games Group",
    fun: "Fun Menu",
    random: "Random Menu",
    stalk: "Stalker Feature",
    owner: "Owner Commands",
    anonim: "Confess Menu",
    tools: "System Tools",
}

function getGreeting() {
    const hour = moment.tz('Asia/Jakarta').hour()
    if (hour >= 4 && hour < 11) return "Selamat pagi 🌅"
    if (hour >= 11 && hour < 15) return "Selamat siang ☀️"
    if (hour >= 15 && hour < 18) return "Selamat sore 🌇"
    return "Selamat malam 🌙"
}

function formatUptime(ms) {
    const total = Math.floor(ms / 1000)
    const d = Math.floor(total / 86400)
    const h = Math.floor((total % 86400) / 3600)
    const m = Math.floor((total % 3600) / 60)
    return [d && `${d}d`, h && `${h}h`, m && `${m}m`].filter(Boolean).join(" ") || "0m"
}

let handler = async (m, { conn, usedPrefix }) => {
    await m.react("✅")
    
    const pushName = m.pushName || "User"
    const botUptime = formatUptime(process.uptime() * 1000)
    const ramPercent = Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
    
    const bodyText = `
${getGreeting()}, *${pushName}*

*SYSTEM DASHBOARD*
• OS : linux ${os.release()}
• CPU : ${os.cpus().length} Core
• RAM : ${ramPercent}% (${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} GB)
• Uptime : ${botUptime}

*└ NAVIGATION ┐*
· Klik tombol di bawah untuk kategori
· Pilih *SEMUA MENU* untuk daftar lengkap`.trim()

    const sections = [
        {
            title: "MAIN NAVIGATION",
            rows: [
                {
                    title: "SEMUA MENU",
                    description: "Lihat seluruh fitur bot",
                    id: `${usedPrefix}allmenu`
                },
                {
                    header: "👑",
                    title: "OWNER",
                    description: "Menu khusus pengembang",
                    id: `${usedPrefix}category owner`
                }
            ]
        },
        {
            title: "KATEGORI FITUR",
            rows: Object.keys(META).map(tag => ({
                header: "↪️",
                title: META[tag].split(' ').slice(1).join(' ').toUpperCase(),
                description: `Buka list fitur ${tag}`,
                id: `${usedPrefix}category ${tag}` // Manggil plugin category
            }))
        }
    ]

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: { text: bodyText },
                    footer: { text: `ValL Assistant • ${moment.tz('Asia/Jakarta').format('DD/MM/YYYY')}` },
                    header: {
                        title: `*${global.botName || "ValL-Assistant"}*`,
                        hasMediaAttachment: false,
                    },
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [{
                            name: "single_select",
                            buttonParamsJson: JSON.stringify({
                                title: "KLIK UNTUK MENU",
                                sections
                            })
                        }],
                    }),
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: "MAIN DASHBOARD",
                            body: getGreeting(),
                            thumbnailUrl: THUMB_URL,
                            sourceUrl: "https://me-val.vercel.app",
                            mediaType: 1,
                            renderLargerThumbnail: true,
                        }
                    }
                })
            }
        }
    }, { userJid: m.sender, quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.help = ["menu"]
handler.command = /^(menu|help|\?)$/i
export default handler