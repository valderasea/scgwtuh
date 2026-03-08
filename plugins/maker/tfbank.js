import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let input = text.split('|').map(v => v.trim());
  
  // Set default values sesuai kebutuhan
  let timezone = input[0] || 'WIB';
  let namaPengirim = input[1];
  let noRekPengirim = input[2];
  let jenisTransaksi = input[3] || 'Transfer Antar Bank'; // Default
  let bankTujuan = input[4];
  let noRekTujuan = input[5];
  let namaTujuan = input[6];
  let nominal = input[7];

  if (!nominal) return m.reply(`> *CARA PAKAI (TF BANK)*

*Format:*
${usedPrefix + command} timezone|namaPengirim|noRek|jenis|bank|noRekTujuan|namaTujuan|nominal

*Contoh (Pake Default):*
${usedPrefix + command} WIB|SLAMET|12345678||BCA|87654321|PT ABC|50000

> *Note:* Kosongkan bagian jenis (||) untuk menggunakan default *Transfer Antar Bank*.`);

  await m.react("⏳");

  try {
    const params = new URLSearchParams({
      timezone,
      namaPengirim,
      noRekPengirim,
      jenisTransaksi,
      bankTujuan,
      noRekTujuan,
      namaTujuan,
      nominal
    });

    let api = `https://kazzz4z.my.id/api/maker/tfbank?${params.toString()}`;
    
    let res = await fetch(api);
    if (!res.ok) {
        let errTxt = await res.text();
        throw new Error(`API Error: ${res.status} - ${errTxt || "Cek input lo"}`);
    }
    
    let buffer = Buffer.from(await res.arrayBuffer());

    await conn.sendMessage(m.chat, { 
      image: buffer, 
      caption: `> *TRANSFER BANK SUCCESS*` 
    }, { quoted: m });
    
    await m.react("✅");

  } catch (e) {
    console.error(e);
    await m.react("❌");
    m.reply(`> ❌ *GAGAL*\n • Error: ${e.message}`);
  }
};

handler.help = ["tfbank"];
handler.tags = ["maker"];
handler.command = /^(tfbank|transfer)$/i;

export default handler;