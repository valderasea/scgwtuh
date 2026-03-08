import cron from "node-cron";
import axios from "axios";

const ID_GRUP = "120363419358524712@g.us";
const ID_KOTA = "1221";
const TIMEZONE = "Asia/Jakarta";

let handler = (m) => m;

handler.before = async function (m, { conn }) {
  // update conn terbaru (biar ga conn zombie)
  global.__conn = conn;

  if (global.__ramadhanInit) return;
  global.__ramadhanInit = true;

  // task sholat doang (yang boleh di-reset)
  global.__ramadhanPrayerTasks = global.__ramadhanPrayerTasks || [];

  const stopPrayerTasks = () => {
    for (const t of global.__ramadhanPrayerTasks) {
      try { t.stop(); } catch {}
    }
    global.__ramadhanPrayerTasks = [];
  };

  const setJadwal = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
      const { data } = await axios.get(
        `https://api.myquran.com/v2/sholat/jadwal/${ID_KOTA}/${today}`,
        { timeout: 20000 }
      );

      if (!data?.status) return console.log("❌ Gagal ambil data API Jadwal Sholat");

      const { imsak, maghrib } = data.data.jadwal;

      // stop yang lama, tapi cuma imsak/maghrib
      stopPrayerTasks();

      const [hI, mI] = imsak.split(":").map(Number);
      const taskImsak = cron.schedule(
        `${mI} ${hI} * * *`,
        async () => {
          try {
            const c = global.__conn;
            if (!c) return console.log("❌ conn belum siap");
            await c.sendMessage(ID_GRUP, {
              text: `📢 *PENGUMUMAN IMSAK*\n\nWaktu Imsak (${imsak} WIB).`,
            });
          } catch (e) {
            console.error("❌ Error kirim Imsak:", e?.message || e);
          }
        },
        { scheduled: true, timezone: TIMEZONE }
      );

      const [hM, mM] = maghrib.split(":").map(Number);
      const taskMaghrib = cron.schedule(
        `${mM} ${hM} * * *`,
        async () => {
          try {
            const c = global.__conn;
            if (!c) return console.log("❌ conn belum siap");
            await c.sendMessage(ID_GRUP, {
              text: `🍹 *SELAMAT BERBUKA*\n\nWaktu Maghrib (${maghrib} WIB).`,
            });
          } catch (e) {
            console.error("❌ Error kirim Maghrib:", e?.message || e);
          }
        },
        { scheduled: true, timezone: TIMEZONE }
      );

      global.__ramadhanPrayerTasks.push(taskImsak, taskMaghrib);

      console.log(`✅ Scheduler Aktif: Imsak ${imsak} | Maghrib ${maghrib}`);
    } catch (e) {
      console.error("❌ Error Ramadhan Plugin:", e?.message || e);
    }
  };

  // init pertama
  await setJadwal();

  // refresh jadwal tiap hari jam 00:01 (INI JANGAN IKUT DI-STOP)
  if (!global.__ramadhanRefreshTask) {
    global.__ramadhanRefreshTask = cron.schedule(
      "1 0 * * *",
      async () => {
        await setJadwal();
      },
      { scheduled: true, timezone: TIMEZONE }
    );
  }
};

export default handler;