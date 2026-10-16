# Status implementasi — Aplikasi native (Admin + Kepala)

Diperbarui 2026-10-16.

| Area | Diimplementasikan | Diuji |
|---|---|---|
| Login terpadu (tab Kepala / Admin, peran dari `app_metadata.role`) | Ya | Belum |
| Area Admin (dashboard, peserta, armada+detail, kepala/PIN/akses, jadwal, pengumuman, destinasi, peta, pengaturan) | Ya | Hanya cek sintaks |
| Area Kepala (beranda+perjalanan, GPS background, peta, info) | Ya | GPS belum diuji di perangkat |
| EAS + Actions | Ya (`eas.json`, `check.yml`, `eas-build.yml`) | Belum pernah dijalankan |

## Hasil penggabungan (monorepo → repo ini)
- `apps/admin` + `apps/kepala` → satu app; rute di `app/admin/*` dan `app/kepala/*` (prefix URL baru `/admin/...`).
- `src/auth.tsx` tunggal (`signInAdmin`, `signInKepala`, `signOut` menghentikan GPS).
- `packages/shared` → `shared/`, tetap diimpor sebagai `@fg/shared` lewat `tsconfig.json` paths.
- Ikon app memakai ikon Admin; ikon Kepala lama disimpan di `assets/icon-kepala-lama.png` untuk dipilih.
- Pemisahan PWA ke repo lain: tidak ada kode bersama (PWA tidak memakai `@fg/shared`).

## Belum diverifikasi
`npm install`, `tsc`, lint, `expo-doctor`, build, dan uji perangkat belum dijalankan (npm diblokir di lingkungan pembuatan). Risiko spesifik penggabungan: resolusi alias `@fg/shared` oleh Metro, dan guard `Stack.Protected` + redirect di `app/index.tsx`. Periksa di `tsc` pertama dan di perangkat.

## Langkah menuju rilis
1. Push → `Cek kode`; perbaiki galat; commit `package-lock.json`.
2. Isi `EXPO_TOKEN` (GitHub Secret); buat keystore.
3. `EAS Build Android` (preview) → pasang APK → jalankan `docs/TEST_CHECKLIST.md` untuk kedua peran.
