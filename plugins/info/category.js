const META = {
    ai: "AI Intelligence",
    downloader: "Downloader",
    group: "Group Management",
    main: "Bot Information",
    anime: "Anime Search",
    maker: "Media Maker",
    rpg: "Games Group",
    fun: "Fun Menu",
    random: "Random Menu",
    stalk: "Stalker Feature",
    owner: "Owner Commands",
    anonim: "Confess Menu",
    tools: "System Tools",
}

let handler = async (m, { conn, usedPrefix, text, command }) => {
    // Logic buat .allmenu (Teks Panjang)
    if (command === 'allmenu') {
        const help = Object.values(global.plugins)
            .filter((p) => !p.disabled)
            .map((p) => ({
                help: [].concat(p.help || []),
                tags: [].concat(p.tags || []),
                owner: p.owner
            }))

        let txt = `*DASHBOARD ALL MENU*\n`
        Object.keys(META).forEach(tag => {
            const cmds = help.filter(p => p.tags.includes(tag))
                .flatMap(p => p.help.map(c => `  ◦ ${usedPrefix + c}${p.owner ? ' *(own)*' : ''}`))
            if (cmds.length > 0) txt += `\n*── [ ${META[tag]} ] ──*\n${cmds.join("\n")}\n`
        })
        return m.reply(txt.trim())
    }

    // Logic buat filter per kategori
    if (!text) return m.reply(`Pilih kategori dari tombol menu!`)
    const tag = text.toLowerCase().trim()
    
    const help = Object.values(global.plugins)
        .filter((p) => !p.disabled && p.tags && p.tags.includes(tag))
        .flatMap((p) => p.help.map((cmd) => `  ◦ ${usedPrefix + cmd}${p.owner ? ' *(own)*' : ''}`))

    if (help.length === 0) return m.reply(`❌ Fitur dalam kategori *${tag}* belum tersedia.`)

    let result = `*── [ ${META[tag] || tag.toUpperCase()} ] ──*\n\n`
    result += help.join("\n")
    result += `\n\n_Ketik ${usedPrefix}menu untuk kembali_`

    await m.reply(result)
}

handler.help = ["category", "allmenu"]
handler.command = /^(category|allmenu)$/i
export default handler