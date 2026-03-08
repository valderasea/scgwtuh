// simpen timestamp terakhir user chat (buat .inactive)
let handler = m => m

handler.all = async function (m) {
  try {
    if (!m?.sender) return
    if (!global.db?.data?.users) return
    const u = (global.db.data.users[m.sender] ||= {})
    u.lastchat = Date.now()
  } catch {}
}

export default handler