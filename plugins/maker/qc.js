import axios from "axios"
import sticker from "../../lib/sticker.js"

let handler = async (m, { conn, text }) => {
  const q = m.quoted
  const content = (q?.text || q?.caption || text || "").trim()
  if (!content) return m.reply("Reply teks atau ketik .qc teks")

  if (m.react) await m.react('⏳')

  const target = q?.sender || m.sender
  const name = await conn.getName(target)

  let avatar
  try {
    avatar = await conn.profilePictureUrl(target, "image")
  } catch {
    avatar = "https://i.ibb.co/2WzXvVZ/avatar.png"
  }

  try {
    const api = `https://api.nexray.web.id/maker/qc`
    const { data } = await axios.get(api, {
      params: {
        text: content,
        name: name,
        avatar: avatar,
        color: "Putih"
      },
      responseType: "arraybuffer"
    })

    // Metadata stiker ngambil dari global
    let metadata = {
        packName: global.packname || "ValL-Assistant",
        packPublish: global.author || "ValL"
    }

    // Convert hasil API (buffer) jadi stiker pake ffmpeg
    let stiker = await sticker.writeExif({ 
        data: Buffer.from(data), 
        mimetype: 'image/png' 
    }, metadata)

    if (stiker) {
        await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
        if (m.react) await m.react('✅')
    } else {
        throw new Error("Gagal mengkonversi Quote Card ke stiker")
    }

  } catch (e) {
    console.error(e)
    if (m.react) await m.react('❌')
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ["qc <teks>"]
handler.tags = ["maker"]
handler.command = /^(qc|quotecard)$/i

export default handler