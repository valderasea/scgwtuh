import { createCanvas, loadImage } from '@napi-rs/canvas'

function circle(ctx, x, y, r) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.closePath()
}

function ellipsis(ctx, text, maxW) {
  if (!text) return ''
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length && ctx.measureText(t + '...').width > maxW) t = t.slice(0, -1)
  return t + '...'
}

export async function renderWelcomeCard({ title, username, groupname, avatarBuf }) {
  const W = 900
  const H = 520
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#0b0f14'
  ctx.fillRect(0, 0, W, H)

  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, 'rgba(255,255,255,0.06)')
  grad.addColorStop(1, 'rgba(255,255,255,0.02)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  const cx = W / 2
  const cy = H / 2 - 40
  const r = 120

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 10
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  circle(ctx, cx, cy, r + 16)
  ctx.fill()
  ctx.restore()

  let img = null
  try {
    img = await loadImage(avatarBuf)
  } catch {
    img = null
  }

  if (img) {
    ctx.save()
    circle(ctx, cx, cy, r)
    ctx.clip()
    const scale = Math.max((r * 2) / img.width, (r * 2) / img.height)
    const iw = img.width * scale
    const ih = img.height * scale
    const ix = cx - iw / 2
    const iy = cy - ih / 2
    ctx.drawImage(img, ix, iy, iw, ih)
    ctx.restore()
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.10)'
    circle(ctx, cx, cy, r)
    ctx.fill()
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.font = '800 44px sans-serif'
  ctx.fillText(title, cx, H - 210)

  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.font = '700 30px sans-serif'
  ctx.fillText(ellipsis(ctx, username, 760), cx, H - 154)

  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '18px sans-serif'
  ctx.fillText(ellipsis(ctx, `to ${groupname}`, 780), cx, H - 110)

  return canvas.toBuffer('image/png')
}