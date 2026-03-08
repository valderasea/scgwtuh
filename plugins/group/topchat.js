import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import fs from "fs";
import moment from "moment-timezone";

const FONT_DIR   = path.join(process.cwd(), "data", "fonts");
const FONT_REG   = path.join(FONT_DIR, "Poppins-Regular.ttf");

let _fontsLoaded = false;
const loadFonts = () => {
  if (_fontsLoaded) return;
  try {
    if (fs.existsSync(FONT_REG)) registerFont(FONT_REG, { family: "Poppins", weight: "normal" });
    _fontsLoaded = true;
  } catch (e) { console.error("[TOPCHAT] Font:", e.message); }
};

const cleanText = (text = "") => {
  return text.replace(/[^\x20-\x7E]/g, "").trim();
};

const roundRect = (ctx, x, y, w, h, r) => {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const buildCanvas = async ({ groupName, totalMessages, topUsers, ppUrl, trackingInfo, avg }) => {
  loadFonts();
  const F = fs.existsSync(FONT_REG) ? "Poppins" : "sans-serif";
  const W = 900;
  const H = 800; // Tinggi disesuaikan biar pas

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Background Deep Dark
  ctx.fillStyle = "#080810";
  ctx.fillRect(0, 0, W, H);

  // Header Section
  ctx.font = `bold 38px "${F}"`;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(cleanText(groupName).toUpperCase(), 50, 80);

  // Avatar
  if (ppUrl) {
    try {
      const img = await loadImage(ppUrl);
      ctx.save();
      ctx.beginPath(); ctx.arc(100, 180, 50, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(img, 50, 130, 100, 100);
      ctx.restore();
    } catch {}
  }

  // Info Stats
  ctx.font = `normal 14px "${F}"`;
  ctx.fillStyle = "#A8A8C8";
  ctx.fillText(trackingInfo, 50, 260);

  // List Top Users
  topUsers.forEach((u, i) => {
    const ry = 320 + (i * 45);
    ctx.font = `500 16px "${F}"`;
    ctx.fillStyle = i < 3 ? "#FFD700" : "#FFFFFF";
    ctx.fillText(`${i + 1}. ${cleanText(u.name)}`, 60, ry);
    
    // Bar progress simple
    const pct = totalMessages > 0 ? (u.count / totalMessages) : 0;
    roundRect(ctx, 300, ry - 12, 400, 12, 6);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fill();
    
    roundRect(ctx, 300, ry - 12, Math.max(pct * 400, 10), 12, 6);
    ctx.fillStyle = "#7C6FFF";
    ctx.fill();

    ctx.fillStyle = "#A8A8C8";
    ctx.fillText(`${u.count} msg`, 720, ry);
  });

  return canvas.toBuffer("image/png");
};

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply("> Perintah ini hanya untuk grup.");
  
  const groupId = m.chat;
  // Sinkronisasi jalur database handler.js lo
  const groupData = global.db.data?.groups?.[groupId];

  if (!groupData || !groupData.stats) {
    return m.reply("> Belum ada data chat terekam. Ketik sesuatu dulu mbut.");
  }

  const topUsers = Object.entries(groupData.stats)
    .map(([num, data]) => ({
      num,
      name: (data.name && data.name !== "undefined") ? data.name : num,
      count: data.count || 0
    }))
    .filter(u => u.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (topUsers.length === 0) return m.reply("> Data masih kosong.");

  await m.react("⏳");

  const groupName = conn.getName(m.chat) || "GROUP STATS";
  const totalMessages = topUsers.reduce((s, u) => s + u.count, 0);
  const trackingSince = groupData.statsSince || Date.now();
  const dH = Math.max(1, Math.floor((Date.now() - trackingSince) / 3600000));
  const avg = Math.round(totalMessages / dH);
  
  let ppUrl = null;
  try { ppUrl = await conn.profilePictureUrl(groupId, "image").catch(() => null); } catch {}

  try {
    const buf = await buildCanvas({
      groupName,
      totalMessages,
      topUsers,
      ppUrl,
      trackingInfo: `Avg ${avg}/jam · Tracking sejak ${moment(trackingSince).format("DD/MM/YY")}`,
      avg
    });

    let cap = `> *TOP CHAT — ${groupName.toUpperCase()}*\n\n`;
    topUsers.forEach((u, i) => {
      const pct = Math.round((u.count / totalMessages) * 100);
      const medals = ["🥇","🥈","🥉","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
      cap += `${medals[i]} *${u.name}*\n • Total: ${u.count.toLocaleString()} (${pct}%)\n\n`;
    });
    cap += `> Total *${totalMessages.toLocaleString()}* | Avg *${avg}/jam*`;

    await conn.sendMessage(m.chat, { image: buf, caption: cap.trim() }, { quoted: m });
    await m.react("✅");
  } catch (err) {
    console.error(err);
    m.reply(`Error: ${err.message}`);
  }
};

handler.help = ["topchat", "tc"];
handler.tags = ["group"];
handler.command = /^(topchat|tc)$/i;
handler.group = true;

export default handler;