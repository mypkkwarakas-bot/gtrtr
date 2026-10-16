# Daftar pengujian

Ini daftar tes, **bukan bukti lulus**. Centang hanya setelah dijalankan dan catat tanggal/perangkat di kolom catatan `IMPLEMENTATION_STATUS.md`.

## Prasyarat data (backend masih kosong saat audit)
- [ ] Buat ≥2 armada (Admin → Armada), pilih ikon.
- [ ] Buat peserta, tetapkan ke armada; tetapkan kepala + atur PIN (PIN tampil sekali).
- [ ] Isi Pengaturan: nama/tanggal/jam acara, kontak, info umum; Destinasi (nama, alamat, koordinat).
- [ ] Buat jadwal dan pengumuman, publikasikan.

## Admin
- [ ] Login/logout/pemulihan sesi (akun dengan `app_metadata.role=admin`); akun non-admin ditolak.
- [ ] Dashboard (angka cocok dengan data); CRUD peserta (nonaktifkan = pengganti hapus); CRUD armada; penugasan kepala (ditolak bila peserta di armada lain/nonaktif); PIN; aktif/nonaktif akses.
- [ ] Jadwal & pengumuman (draft/published/archived), destinasi, pengaturan, peta global, refresh peta, minta lokasi terbaru.
- [ ] Loading/empty/error/offline, tombol Back, layar kecil + keyboard terbuka.

## Kepala Rombongan
- [ ] Login kode+PIN (salah → pesan jelas; 5 gagal → RATE_LIMITED); keluar.
- [ ] Armada & peserta sesuai penugasan saja.
- [ ] Mulai/akhiri perjalanan; tombol tidak bisa ditekan ganda.
- [ ] Izin lokasi; GPS foreground; **GPS background**; layar terkunci.
- [ ] Titik masuk ke `live_locations` dan tampil di Admin & PWA; status Terkini → Tertunda → Lama sesuai ambang.
- [ ] Jaringan putus lalu pulih (antrean terkirim berurutan); GPS dimatikan; izin dicabut; baterai dibatasi; **force-stop**; logout; perjalanan berakhir → tracking berhenti.
- [ ] Peta Kepala (dengan/tanpa kunci Google Maps), jadwal, pengumuman.

## PWA Peserta
- [ ] Kode benar/salah/nonaktif; tanpa kode; keluar/ganti kode.
- [ ] Armada resmi tampil; ajukan armada (hanya bila belum ditetapkan) dan terlihat sebagai "Pilihan Anda".
- [ ] Beranda, countdown, pengumuman (ticker + daftar), jadwal, destinasi.
- [ ] Peta: marker armada, destinasi, status stale; `show_map_to_participants=false` → pesan disembunyikan.
- [ ] Offline banner; kosong/error state; layar mobile kecil; instalasi PWA (Android Chrome, iOS Safari "Add to Home Screen"); update service worker.

## Build & kualitas
- [ ] `npm install` lalu commit `package-lock.json`.
- [ ] `npm run typecheck` (admin, kepala, shared, pwa) tanpa galat.
- [ ] `npx expo install --check` + `npx expo-doctor` tiap app Android.
- [ ] Workflow `Cek kode`, `PWA Peserta (build)`, `EAS Build Android` (preview APK terpasang dan terbuka).
- [ ] Tidak ada secret di repo/bundle (`git grep -i service_role` kosong).

## Backend (Supabase)
- [ ] Aktifkan *Leaked password protection* (Auth → Password security).
- [ ] Advisor keamanan dijalankan ulang setelah perubahan skema.
