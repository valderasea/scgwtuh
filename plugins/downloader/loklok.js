import { searchLoklok } from "../../lib/loklok.js"

global.loklokSession = global.loklokSession || {}

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) return m.reply("Masukin judulnya.")

  if (m.react) await m.react("⏳")

  try {
    const results = await searchLoklok(text)
    if (!results.length) return m.reply("Ga ketemu.")

    const sliced = results.slice(0, 10)
    global.loklokSession[m.chat] = {
      at: Date.now(),
      results: sliced
    }

    const sections = [
      {
        title: "Pilih Film",
        rows: sliced.map((v, i) => ({
          header: v.year || "",
          title: v.title,
          description: `Rating: ${v.rating || "-"} | ${v.duration || "-"} | ${v.quality || "-"}`,
          id: `${usedPrefix}loklokget ${i + 1}`
        }))
      }
    ]

    const msg = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text: `🎬 *LOKLOK SEARCH*\n\nHasil pencarian: *${text}*\n\nSilakan pilih film di bawah.`
            },
            footer: {
              text: "ValL Assistant • Loklok"
            },
            header: { hasMediaAttachment: false },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: JSON.stringify({
                    title: "Pilih Film 🎥",
                    sections
                  })
                }
              ]
            }
          }
        }
      }
    }

    await conn.relayMessage(m.chat, msg, {})
    if (m.react) await m.react("✅")

  } catch (e) {
    console.error(e)
    m.reply("Error.")
  }
}

handler.help = ["loklok <judul>"]
handler.tags = ["downloader"]
handler.command = /^loklok$/i

export default handler