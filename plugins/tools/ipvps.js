import os from "os";
import { execSync } from "child_process";

function getLocalIPs() {
  const result = [];
  const ifaces = os.networkInterfaces();
  for (const [name, addrs] of Object.entries(ifaces)) {
    for (const addr of addrs) {
      if (addr.internal) continue; 
      result.push({ iface: name, ip: addr.address, family: addr.family });
    }
  }
  return result;
}

function getPublicIPFromCmd() {
  const cmds = [
    `curl -s --max-time 4 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null`,      
    `curl -s --max-time 5 https://api.ipify.org 2>/dev/null`,
    `curl -s --max-time 5 https://ipv4.icanhazip.com 2>/dev/null`,
  ];

  for (const cmd of cmds) {
    try {
      const result = execSync(cmd, { timeout: 6000 }).toString().trim();
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(result)) return result;
    } catch {}
  }
  return null;
}

function getIPInfo(ip) {
  try {
    const out = execSync(`curl -s --max-time 5 https://ipinfo.io/${ip}/json 2>/dev/null`, { timeout: 6000 }).toString().trim();
    const data = JSON.parse(out);
    return {
      org:      data.org      || "-",
      city:     data.city     || "-",
      region:   data.region   || "-",
      country:  data.country  || "-",
      timezone: data.timezone || "-",
    };
  } catch { return null; }
}

let handler = async (m, { conn }) => {
  await m.react("⏳");

  try {
    const localIPs  = getLocalIPs();
    const publicIP  = getPublicIPFromCmd();
    const ipInfo    = publicIP ? getIPInfo(publicIP) : null;

    let msg = `> *VPS NETWORK INFO*\n\n`;
    
    if (publicIP) {
      msg += `*Public Connection:*\n`;
      msg += ` • IP: \`${publicIP}\`\n`;
      if (ipInfo) {
        msg += ` • ISP: ${ipInfo.org}\n`;
        msg += ` • Lokasi: ${ipInfo.city}, ${ipInfo.country}\n`;
        msg += ` • Timezone: ${ipInfo.timezone}\n\n`;
      }
    }

    msg += `*Local Connection:*\n`;
    msg += ` • Hostname: ${os.hostname()}\n`;

    if (localIPs.length) {
      for (const { iface, ip } of localIPs) {
        msg += ` • ${iface}: \`${ip}\`\n`;
      }
    }

    await m.reply(msg.trim());
    await m.react("✅");

  } catch (err) {
    await m.react("❌");
    m.reply(`Error: ${err.message}`);
  }
};

handler.help = ["ip", "myip"];
handler.tags = ["tools"];
handler.command = /^(ip|myip|ipvps)$/i;

export default handler;