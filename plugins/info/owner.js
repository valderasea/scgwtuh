let handler = async (m, { conn }) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:;ValL;;;
FN:ValL
X-WA-BIZ-NAME:ValL Assistant
X-WA-BIZ-DESCRIPTION:Owner of ValL Assistant Script
TEL;waid=6282249763982:+62 822-4976-3982
END:VCARD`;

    const q = {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
        },
        message: {
            interactiveMessage: {
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "payment_info",
                            buttonParamsJson: JSON.stringify({
                                currency: "IDR",
                                total_amount: { value: 9999999999999, offset: 0 },
                                reference_id: "VALLASSISTANT",
                                type: "physical-goods",
                                order: {
                                    status: "pending",
                                    subtotal: { value: 9999999999999, offset: 0 },
                                    order_type: "ORDER",
                                    items: [
                                        {
                                            name: "ValL Assistant",
                                            amount: { value: 9999999999999, offset: 0 },
                                            quantity: 1,
                                            sale_amount: { value: 9999999999999, offset: 0 }
                                        }
                                    ]
                                }
                            })
                        }
                    ]
                }
            }
        }
    };

    await conn.sendMessage(
        m.chat,
        {
            contacts: {
                displayName: "ValL",
                contacts: [{ vcard: vcard }],
            },
            contextInfo: {
                externalAdReply: {
                    title: "© 2026 ValL Assistant",
                    body: "Contact via WhatsApp",
                    mediaType: 1,
                    thumbnailUrl: "https://files.catbox.moe/8tw69l.jpeg",
                    renderLargerThumbnail: true,
                    showAdAttribution: true,
                    sourceUrl: "https://wa.me/6282249763982",
                },
            },
        },
        { quoted: q }
    );
};

handler.help = ["owner"];
handler.tags = ["info"];
handler.command = /^(owner|creator)$/i;

export default handler;