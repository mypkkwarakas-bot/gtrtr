# PWA Peserta

`apps/peserta-pwa` — React 19 + Vite + TypeScript, mobile-first, dapat dipasang (manifest + service worker). Hanya **membaca** data; tidak mengirim GPS dan tidak meminta izin lokasi peserta.

## Fitur → sumber data (semua lewat peran `anon`, tanpa login)
| Fitur | Sumber | Catatan |
|---|---|---|
| Identitas peserta | RPC `lookup_participant(p_code)` | Kode disimpan di `localStorage` (hanya kode, bukan data) dan diverifikasi ulang tiap aplikasi dibuka. Kode tidak ditemukan/nonaktif → dihapus. Tanpa kode, aplikasi tetap bisa dipakai untuk informasi umum. |
| Armada resmi vs pilihan sendiri | `lookup_participant` (`fleet` vs `requested_fleet`) | Ditampilkan dengan label berbeda ("Armada resmi" / "Pilihan Anda · menunggu penetapan"). Armada resmi tidak dapat diubah dari PWA. |
| Ajukan armada | RPC `request_fleet(p_code, p_fleet_id)` | Hanya mencatat `requested_fleet_id`; hanya tampil bila armada resmi belum ditetapkan. Pesan sukses diambil dari backend dan data dimuat ulang. |
| Beranda, countdown | `event_settings` (id=1) + `schedules` published | Countdown ke acara berikutnya, atau ke `event_date`+`start_time` bila tak ada jadwal mendatang. Memakai jam perangkat. |
| Pengumuman | `announcements` status `published` | Ticker bisa dijeda (hover/sentuh), mati bila "kurangi gerakan"; isi lengkap selalu ada sebagai daftar. |
| Jadwal | `schedules` status `published` | Dikelompokkan per hari (WIB), penanda Berikutnya/Berlangsung/Selesai. |
| Peta | RPC `get_fleet_map()` + destinasi `event_settings` | `MAP_DISABLED` → pesan "peta disembunyikan". Status kesegaran dihitung ulang di klien dengan ambang backend; polling 20 dtk hanya saat tab terlihat. Tile: OpenStreetMap (tanpa API key). |
| Info umum & kontak | `event_settings.general_info`, `contact_info` | Hanya yang diisi panitia. |

## Menjalankan lokal
```bash
cp apps/peserta-pwa/.env.example apps/peserta-pwa/.env   # isi URL & kunci publishable
npm install
npm run pwa
```

## Build & deploy (hosting statis)
Build: `npm run pwa:build` → `apps/peserta-pwa/dist`. Sajikan sebagai situs statis dengan **HTTPS** (syarat instalasi PWA) dan fallback SPA ke `index.html`. Sudah disediakan `netlify.toml` dan `vercel.json` (fallback SPA + header `no-cache` untuk `sw.js` dan manifest).

Environment variable di hosting (build-time): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (kunci publishable). **Jangan** memakai service_role.

Netlify: hubungkan repo (base dir sudah di `netlify.toml`). Vercel: Root Directory `apps/peserta-pwa`, Install Command `cd ../.. && npm install`, Build Command `npm run build`, Output `dist`.

## Cache
Service worker hanya menyimpan cangkang aplikasi (HTML, aset berhash, ikon). Permintaan ke Supabase dan tile peta **tidak** di-cache, sehingga data lama tidak tampak baru. Saat offline, aplikasi terbuka dengan banner offline dan data terakhir di memori; mulai ulang saat offline tidak menampilkan data.

## Belum diverifikasi
`npm install`, `tsc`, `vite build`, instalasi PWA, dan tampilan di perangkat belum dijalankan (registry npm tidak terjangkau dari lingkungan pembuatan). Kontrak RPC/RLS yang dipakai sudah diuji langsung ke Supabase (lihat `IMPLEMENTATION_STATUS.md`).
