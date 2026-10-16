# Background GPS (aplikasi Kepala Rombongan)

Kode: `src/kepala/tracking.ts`, dipakai `app/kepala/(tabs)/index.tsx`. Status: **ditulis, belum diuji di perangkat fisik**.

## Komponen
- `expo-location` `startLocationUpdatesAsync` + `expo-task-manager` (task `fg-kepala-location`) dengan **foreground service** Android dan notifikasi persisten ("perjalanan berjalan").
- Konfigurasi native lewat `app.config.ts`: izin `ACCESS_FINE/COARSE/BACKGROUND_LOCATION`, `FOREGROUND_SERVICE(_LOCATION)`, `POST_NOTIFICATIONS`, plugin `expo-location` (background + foreground service). Perlu **development/preview/production build** (EAS); Expo Go tidak membuktikan fitur ini.
- Parameter awal: `Accuracy.High`, `timeInterval` 5 dtk, `distanceInterval` 0. Ini target awal untuk dievaluasi (baterai vs ketepatan), bukan jaminan.

## Alur
1. Izin foreground → cek layanan GPS → izin background (dilaporkan jujur bila ditolak).
2. `start_trip()` → `trip_id` disimpan di SecureStore → tracking dimulai. Bila tracking gagal mulai, `end_trip()` dipanggil.
3. Tiap titik dikirim ke `submit_location` **berurutan menurut `recorded_at`**. Waktu perangkat (`location.timestamp`) dikirim sebagai `p_recorded_at`; server mencatat `received_at` sendiri.
4. Nilai sensor tidak valid (akurasi/kecepatan negatif, heading di luar 0–360) dikirim `null` agar tidak ditolak CHECK backend.
5. "Tersimpan" hanya bila `ok=true` **dan** `data.saved=true`. `IGNORED_OLDER` (lokasi tidak lebih baru) tidak dihitung tersimpan.
6. Berhenti otomatis pada `TRIP_ENDED`, `NO_ASSIGNMENT`, `TRIP_NOT_FOUND`, saat `end_trip`, dan saat keluar akun.
7. Buka ulang aplikasi: GPS disinkronkan dengan `active_trip` dari server.

## Offline
Antrean **di memori** (maks 120 titik), titik >14 menit dibuang (batas backend 15 menit: `LOCATION_TOO_OLD`). Hilang bila aplikasi dimatikan paksa atau proses dimatikan OS. Titik lama tidak menimpa yang baru (urutan + `IGNORED_OLDER`).

## Batasan Android (tidak ada jaminan tracking tanpa henti)
Tracking dapat berhenti bila: aplikasi dihentikan paksa, perangkat mati, izin dicabut, GPS dimatikan, atau OS/produsen membatasi baterai (Doze, "optimasi baterai", app standby). Kepala rombongan disarankan: izin lokasi "Selalu", matikan optimasi baterai untuk aplikasi, jangan swipe-close dari recent apps pada beberapa merek. Baterai (`p_battery_pct`) dikirim `null` (expo-battery belum ditambahkan).

## Permintaan lokasi dari Admin
`request_fleet_location` hanya mencatat permintaan. Realtime tidak membangunkan aplikasi yang dihentikan; sebuah permintaan hanya terjawab bila tracking aktif mengirim titik baru.

## Pengujian fisik wajib (semua **belum dilakukan**)
Lihat bagian Kepala di `TEST_CHECKLIST.md`.
