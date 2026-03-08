import axios from "axios"

const BASE = "https://api.apocalypse.web.id"

const http = axios.create({
  baseURL: BASE,
  timeout: 60000,
  headers: { "User-Agent": "Mozilla/5.0" }
})

async function searchLoklok(q) {
  const { data } = await http.get("/drama/loklok/search", { params: { q } })
  if (!data?.status) return []
  return data.result || []
}

async function detailLoklok(url) {
  const { data } = await http.get("/drama/loklok/detail", { params: { url } })
  if (!data?.status) return null
  return data.result
}

function pickBestDownload(downloads = []) {
  const sorted = downloads
    .map(d => {
      const q = parseInt(d.quality, 10)
      return {
        ...d,
        qScore: Number.isFinite(q) ? q : 0,
        isMp4: /\.mp4(\?|$)/i.test(d.url)
      }
    })
    .sort((a, b) => (b.qScore - a.qScore) || (b.isMp4 - a.isMp4))

  return sorted[0] || null
}

export { searchLoklok, detailLoklok, pickBestDownload }