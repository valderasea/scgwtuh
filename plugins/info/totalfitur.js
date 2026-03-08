import { createCanvas } from "@napi-rs/canvas"

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function ellipsis(ctx, text, maxW) {
  if (!text) return ""
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length && ctx.measureText(t + "...").width > maxW) t = t.slice(0, -1)
  return t + "..."
}

function getPluginList() {
  const p = global.plugins || {}
  return Object.keys(p)
    .map(k => p[k])
    .filter(Boolean)
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return []
  return tags
    .map(t => String(t || "").trim().toLowerCase())
    .filter(Boolean)
}

function countFeatures(plugins) {
  let total = 0
  const perTag = new Map()

  for (const pl of plugins) {
    const hasFeature = !!pl.command || (Array.isArray(pl.help) && pl.help.length) || typeof pl.help === "string"
    if (!hasFeature) continue
    total++

    const tags = normalizeTags(pl.tags)
    if (!tags.length) {
      perTag.set("lainnya", (perTag.get("lainnya") || 0) + 1)
      continue
    }
    for (const t of tags) perTag.set(t, (perTag.get(t) || 0) + 1)
  }

  const sorted = Array.from(perTag.entries()).sort((a, b) => b[1] - a[1])
  return { total, sorted }
}

function renderStatsImage({ total, sorted, title }) {
  const W = 1100
  const H = 680
  const pad = 40
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext("2d")

  ctx.fillStyle = "#0b0f14"
  ctx.fillRect(0, 0, W, H)

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, "rgba(255,255,255,0.04)")
  bg.addColorStop(1, "rgba(255,255,255,0.02)")
  ctx.fillStyle = bg
  roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 28)
  ctx.fill()
  ctx.strokeStyle = "rgba(255,255,255,0.10)"
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = "rgba(255,255,255,0.92)"
  ctx.font = "700 34px sans-serif"
  ctx.textBaseline = "top"
  ctx.fillText(title, pad + 26, pad + 22)

  ctx.fillStyle = "rgba(255,255,255,0.55)"
  ctx.font = "14px sans-serif"
  ctx.fillText(`Generated • ${new Date().toLocaleString()}`, pad + 26, pad + 66)

  const cardY = pad + 110
  const cardH = 110
  const cardW = W - pad * 2 - 52
  const cardX = pad + 26

  ctx.fillStyle = "rgba(255,255,255,0.05)"
  roundRect(ctx, cardX, cardY, cardW, cardH, 20)
  ctx.fill()
  ctx.strokeStyle = "rgba(255,255,255,0.10)"
  ctx.stroke()

  ctx.fillStyle = "rgba(255,255,255,0.55)"
  ctx.font = "12px sans-serif"
  ctx.fillText("TOTAL FITUR", cardX + 22, cardY + 18)

  ctx.fillStyle = "rgba(255,255,255,0.95)"
  ctx.font = "800 52px sans-serif"
  ctx.textBaseline = "alphabetic"
  ctx.fillText(String(total), cardX + 22, cardY + 86)

  const listTop = sorted.slice(0, 10)
  const listX = cardX
  const listY = cardY + cardH + 26
  const rowH = 44
  const barW = 520
  const labelW = 280
  const maxVal = Math.max(1, ...listTop.map(x => x[1]))

  ctx.fillStyle = "rgba(255,255,255,0.55)"
  ctx.font = "12px sans-serif"
  ctx.textBaseline = "top"
  ctx.fillText("BREAKDOWN PER KATEGORI (TOP 10)", listX, listY - 20)

  for (let i = 0; i < listTop.length; i++) {
    const [tag, val] = listTop[i]
    const y = listY + i * rowH

    ctx.fillStyle = "rgba(255,255,255,0.04)"
    roundRect(ctx, listX, y, cardW, 36, 14)
    ctx.fill()
    ctx.strokeStyle = "rgba(255,255,255,0.08)"
    ctx.stroke()

    ctx.fillStyle = "rgba(255,255,255,0.85)"
    ctx.font = "700 14px sans-serif"
    const label = ellipsis(ctx, `${i + 1}. ${tag}`, labelW)
    ctx.fillText(label, listX + 16, y + 10)

    ctx.fillStyle = "rgba(255,255,255,0.55)"
    ctx.font = "13px sans-serif"
    const valText = String(val)
    ctx.fillText(valText, listX + 16 + labelW + 14, y + 10)

    const bx = listX + 16 + labelW + 54
    const by = y + 14
    const bw = Math.floor((val / maxVal) * barW)

    ctx.fillStyle = "rgba(255,255,255,0.10)"
    roundRect(ctx, bx, by, barW, 10, 5)
    ctx.fill()

    ctx.fillStyle = "rgba(29,185,84,0.85)"
    roundRect(ctx, bx, by, Math.max(10, bw), 10, 5)
    ctx.fill()
  }

  ctx.fillStyle = "rgba(255,255,255,0.40)"
  ctx.font = "12px sans-serif"
  ctx.textBaseline = "bottom"
  ctx.fillText("..", pad + 26, H - pad - 18)

  return canvas.toBuffer("image/png")
}

let handler = async (m, { conn }) => {
  const plugins = getPluginList()
  const { total, sorted } = countFeatures(plugins)
  const img = renderStatsImage({ total, sorted, title: "Feature Stats" })
  return conn.sendMessage(m.chat, { image: img, caption: `Total fitur: ${total}` }, { quoted: m })
}

handler.help = ["totalfitur"]
handler.tags = ["tools"]
handler.command = /^(fitur|totalfitur)$/i

export default handler