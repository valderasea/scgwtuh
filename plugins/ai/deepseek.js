import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';

const CONFIG = {
    URLS: {
        CHAT: 'https://deepseekv2-qbvg2hl3qq-uc.a.run.app',
        KEY: 'https://rotatingkey-qbvg2hl3qq-uc.a.run.app'
    },
    HEADERS: {
        'User-Agent': 'okhttp/4.12.0',
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/json'
    },
    AES_INPUT_KEY: "NiIsImtpZCI6I56"
};

async function getSecretKey() {
    try {
        const response = await axios.get(CONFIG.URLS.KEY, {
            headers: { 'User-Agent': 'Android', 'Accept-Encoding': 'gzip' }
        });
        return response.data?.rotatingKey || null;
    } catch (error) { return null; }
}

function generateSecurityHeaders(secretKey) {
    try {
        const iv = crypto.randomBytes(16);
        const keyBuffer = Buffer.from(secretKey, 'utf8');
        const cipher = crypto.createCipheriv('aes-128-cbc', keyBuffer, iv);
        let encrypted = cipher.update(CONFIG.AES_INPUT_KEY, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return {
            iv: iv.toString('base64') + '\n',
            authorization: "Bearer " + encrypted.toString('base64')
        };
    } catch (error) { return null; }
}

const toBase64 = async (input) => {
    try {
        let buffer;
        if (Buffer.isBuffer(input)) buffer = input;
        else if (input.startsWith('http')) {
            const res = await axios.get(input, { responseType: 'arraybuffer' });
            buffer = Buffer.from(res.data);
        } else if (fs.existsSync(input)) {
            buffer = fs.readFileSync(input);
        } else return null;
        return buffer.toString('base64');
    } catch (e) { return null; }
};

export const deepseek = {
    chat: async (prompt, history = [], media = null, model = 'deepseek-chat') => {
        try {
            const secretKey = await getSecretKey();
            if (!secretKey) return { success: false, msg: 'Failed to fetch secret key' };

            const security = generateSecurityHeaders(secretKey);
            if (!security) return { success: false, msg: 'Failed to generate security' };

            let messages = [...history];
            const currentMessage = { role: "user", content: prompt };
            let payloadMessages = [...messages, currentMessage];

            let finalModel = model;
            let base64Image = null;

            if (media) {
                const rawBase64 = await toBase64(media);
                if (rawBase64) {
                    finalModel = 'gpt-4o-mini'; // Model otomatis berubah ke vision jika ada gambar
                    base64Image = `data:image/jpeg;base64,${rawBase64}`;
                    payloadMessages = [{ role: "user", content: prompt }]; 
                }
            }

            const dataPayload = {
                data: prompt,
                iv: security.iv,
                messages: payloadMessages,
                model: finalModel,
                secretKey: secretKey
            };

            if (base64Image) dataPayload.image1 = base64Image;

            const response = await axios.post(CONFIG.URLS.CHAT, dataPayload, {
                headers: { ...CONFIG.HEADERS, 'authorization': security.authorization }
            });

            const apiResult = response.data?.data;
            if (apiResult?.choices?.[0]) {
                const messageObj = apiResult.choices[0].message;
                const replyText = messageObj.content || "";
                const reasoningText = messageObj.reasoning_content || null;
                const newHistory = [...messages, currentMessage, { role: "assistant", content: replyText }];

                return {
                    success: true,
                    reply: replyText,
                    reasoning: reasoningText,
                    history: newHistory
                };
            }
            return { success: false, msg: 'Empty response' };
        } catch (error) {
            return { success: false, msg: error.message };
        }
    }
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Inisialisasi Database Sesi
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
    global.db.data.users[m.sender].aiHistory = global.db.data.users[m.sender].aiHistory || [];

    // Fitur Reset Sesi
    if (text === 'reset' || text === 'clear') {
        global.db.data.users[m.sender].aiHistory = [];
        return m.reply('✅ Sesi percakapan telah dibersihkan.');
    }

    if (!text && !m.quoted) throw `*Contoh:* ${usedPrefix + command} Halo, siapa namamu?\n\n*Reset Sesi:* ${usedPrefix + command} reset`;

    // Ambil media (jika user mengirim foto atau reply foto)
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    let media = null;

    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    try {
        if (/image/g.test(mime)) {
            media = await q.download();
        }

        // Tentukan model: .ai (chat biasa) atau .reason (deepseek-reasoner)
        let model = command === 'reason' ? 'deepseek-reasoner' : 'deepseek-chat';
        
        // Ambil history sebelumnya
        let history = global.db.data.users[m.sender].aiHistory;

        // Kirim ke API
        let res = await deepseek.chat(text || "Jelaskan gambar ini", history, media, model);

        if (res.success) {
            // Simpan history terbaru
            global.db.data.users[m.sender].aiHistory = res.history;

            // Batasi agar history tidak membebani memori (maks 15 pesan)
            if (global.db.data.users[m.sender].aiHistory.length > 15) {
                global.db.data.users[m.sender].aiHistory.shift();
            }

            let resultText = '';
            
            // Tampilkan hasil reasoning jika ada
            if (res.reasoning) {
                resultText += `*──「 THOUGHT 」──*\n\n_${res.reasoning}_\n\n`;
                resultText += `*──「 ANSWER 」──*\n\n`;
            }

            resultText += res.reply;

            await conn.reply(m.chat, resultText, m);
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } else {
            throw res.msg;
        }

    } catch (e) {
        console.error(e);
        m.reply(`*Terjadi Kesalahan:* ${e.message || e}`);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['deepseek <teks>', 'reason <teks>', 'deepseek reset'];
handler.tags = ['ai'];
handler.command = /^(deepseek|reason)$/i;

export default handler;