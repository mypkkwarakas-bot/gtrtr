# EAS Build

Aplikasi: `apps/admin` (`com.gathering.com.admin`) dan `apps/kepala` (`com.gathering.com.kepala`). Profil di `eas.json`: `development`, `preview` (APK), `production` (AAB, auto-increment versi).

## Environment variables EAS (expo.dev → project → Environment variables)
Dibuat untuk **kedua** project, untuk environment `preview` dan `production`:

| Nama | Visibilitas | Isi |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Plain text | URL project Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Plain text | kunci publishable/anon (aman di klien; dibatasi RLS) |
| `GOOGLE_MAPS_ANDROID_API_KEY` | Sensitive | kunci Maps SDK Android, dibatasi package + SHA-1 |
| `EAS_PROJECT_ID` | Plain text | ID project EAS aplikasi tersebut |

**Jangan** memasukkan service-role key ke mana pun. Tanpa `GOOGLE_MAPS_ANDROID_API_KEY` peta di aplikasi Kepala menampilkan pesan "Peta belum dapat ditampilkan" (koordinat tetap tampil).

## Menjalankan build
Pakai workflow GitHub `EAS Build Android` (lihat `GITHUB_ACTIONS.md`). APK `preview` diunduh dari halaman build di expo.dev lalu dipasang di perangkat Android.

## Belum diverifikasi
Belum ada build yang dijalankan. Versi paket Expo SDK 54 belum dicek terhadap registry; jalankan workflow `Cek kode` lebih dulu.
