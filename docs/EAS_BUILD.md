# EAS Build

Satu aplikasi Android: `com.gathering.com` (Admin + Kepala Rombongan, dibedakan lewat login). Profil di `eas.json`: `development`, `preview` (APK), `production` (AAB, auto-increment versi).

## Environment variables EAS (expo.dev → project → Environment variables)
Untuk environment `preview` dan `production`:

| Nama | Visibilitas | Isi |
|---|---|---|
| (tidak dipakai lagi) | Plain text | URL project Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Plain text | kunci publishable/anon (aman di klien; dibatasi RLS) |
| `GOOGLE_MAPS_ANDROID_API_KEY` | Sensitive | kunci Maps SDK Android, dibatasi package + SHA-1 |

**Jangan** memasukkan service-role key ke mana pun. Tanpa `GOOGLE_MAPS_ANDROID_API_KEY` peta menampilkan "Peta belum dapat ditampilkan" (koordinat tetap tampil).

## Menjalankan build
Workflow GitHub `EAS Build Android` (lihat `GITHUB_ACTIONS.md`). APK `preview` diunduh dari expo.dev lalu dipasang di perangkat.

## Catatan penggabungan
Izin lokasi latar belakang + foreground service kini ada di satu app (dipakai Kepala). Admin tidak memintanya karena izin hanya diminta saat Kepala menekan "Mulai perjalanan". Bila nanti rilis ke Play Store, deklarasi penggunaan lokasi latar belakang berlaku untuk app ini.

## Belum diverifikasi
Belum ada build dijalankan. Versi paket Expo SDK 54 belum dicek terhadap registry; jalankan `Cek kode` lebih dulu.

## Update: konfigurasi ditanam di kode
URL dan kunci publishable Supabase kini ada di `src/config.ts` (aplikasi satu event), jadi variabel `EXPO_PUBLIC_*` di EAS **tidak perlu** diisi. Cukup `EXPO_TOKEN` (GitHub Secret); Project ID sudah tertanam di `app.config.ts`. Kunci publishable memang publik; service_role tidak boleh pernah masuk.
