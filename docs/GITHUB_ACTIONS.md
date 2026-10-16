# GitHub Actions

Dua workflow di `.github/workflows/`, dijalankan dari tab **Actions**.

| Workflow | Kapan | Fungsi |
|---|---|---|
| `check.yml` | push/PR atau manual | `npm install`, TypeScript, lint, `expo install --check`, `expo-doctor`. Hanya TypeScript yang menggagalkan job. |
| `eas-build.yml` | manual | Kirim build Android ke EAS. Pilih `profile` (preview = APK, production = AAB). |

## Disiapkan sekali (GitHub)
- Secret `EXPO_TOKEN` (expo.dev → Access tokens).
- (Tidak perlu Variable: Project ID EAS tertanam di `app.config.ts`.)

Variabel build aplikasi (Supabase, Google Maps) diatur di EAS: `docs/EAS_BUILD.md`.

## Catatan jujur
- Belum pernah dijalankan; hasil pertama kemungkinan memuat galat TypeScript/versi paket.
- `--no-wait`: job selesai setelah build terkirim; APK ada di expo.dev → Builds.
- Keystore Android pertama harus dibuat sekali lewat dashboard EAS (Credentials) karena `--non-interactive`.
