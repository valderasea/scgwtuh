import { detailLoklok, pickBestDownload } from "../../lib/loklok.js"

global.loklokSession = global.loklokSession || {}

let handler = async (m, { conn, text }) => {
  const n = parseInt(text, 10)
  if (!n) return m.reply("Nomornya mana?")

  const sess = global.loklokSession[m.chat]
  if (!sess?.results?.length) return m.reply("Search dulu pake .loklok <judul>")

  const picked = sess.results[n - 1]
  if (!picked) return m.reply("Nomor ngaco.")

  const detail = await detailLoklok(picked.url)
  if (!detail) return m.reply("Detail gagal.")

  const links = detail.downloadLinks || []
  const best = pickBestDownload(links)

  let out =
    `*LOKLOK DETAIL*\n\n` +
    `• Judul: ${picked.title}\n` +
    `• Tahun: ${picked.year || "-"}\n` +
    `• Rating: ${picked.rating || "-"}\n` +
    `• Durasi: ${picked.duration || "-"}\n` +
    `• Genre: ${(detail?.metadata?.genres || []).join(", ") || "-"}\n` +
    `• Negara: ${(detail?.metadata?.countries || []).join(", ") || "-"}\n\n`

  if (best) out += `*Best:* ${best.quality} - ${best.title}\n${best.url}\n\n`

  out += `*All Links:*\n`
  links.forEach((d, i) => {
    out += `${i + 1}. [${d.quality}] ${d.title}\n${d.url}\n`
  })

  await conn.sendMessage(m.chat, { text: out }, { quoted: m })
}

handler.help = ["loklokget <nomor>"]
handler.tags = ["downloader"]
handler.command = /^loklokget$/i
export default handler