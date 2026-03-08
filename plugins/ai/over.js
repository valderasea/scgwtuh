import axios from "axios";
import crypto from "crypto";

let handler = async (m, {
    text
}) => {
    if (!text)
        return m.reply(
            "Masukkan pertanyaan.\n\nContoh:\n.ai jelaskan apa itu plankton"
        );

    try {
        const url = "https://api.overchat.ai/v1/chat/completions";

        const payload = {
            chatId: crypto.randomUUID(),
            model: "openai/gpt-4o",
            messages: [{
                id: crypto.randomUUID(),
                role: "user",
                content: text
            }],
            personaId: "gpt-4o-landing",
            frequency_penalty: 0,
            max_tokens: 4000,
            presence_penalty: 0,
            stream: true,
            temperature: 0.5,
            top_p: 0.95
        };

        const headers = {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "X-Device-Platform": "web",
            "X-Device-Language": "id-ID",
            "X-Device-Uuid": crypto.randomUUID(),
            "X-Device-Version": "1.0.44",
            "Origin": "https://overchat.ai",
            "Referer": "https://overchat.ai/chat/best-free-ai-chat",
            "User-Agent": "Mozilla/5.0 (Android 12; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0"
        };

        const res = await axios.post(url, payload, {
            headers,
            responseType: "stream"
        });

        let result = "";
        let buffer = "";

        await new Promise((resolve, reject) => {
            res.data.on("data", chunk => {
                buffer += chunk.toString();

                const lines = buffer.split("\n");
                buffer = lines.pop();

                for (let line of lines) {
                    line = line.trim();
                    if (!line.startsWith("data:")) continue;

                    const data = line.replace(/^data:\s*/, "");
                    if (!data) continue;

                    if (data === "[DONE]") return resolve();

                    try {
                        const json = JSON.parse(data);
                        const delta = json?.choices?.[0]?.delta?.content;
                        if (delta) result += delta;
                    } catch {}
                }
            });

            res.data.on("error", reject);
            res.data.on("end", resolve);
        });

        if (!result.trim())
            return m.reply("Tidak ada jawaban yang dihasilkan.");

        m.reply(result.trim());

    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat memproses permintaan.");
    }
};

handler.help = ["overchat"];
handler.tags = ["ai"];
handler.command = /^overchat$/i;

export default handler;