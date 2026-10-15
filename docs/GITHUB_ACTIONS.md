# GitHub Actions

Dua workflow di `.github/workflows/`. Keduanya dijalankan dari tab **Actions** di GitHub (tanpa terminal lokal).

| Workflow | Kapan | Fungsi |
|---|---|---|
| `check.yml` | otomatis saat push/PR, atau manual | `npm install`, TypeScript semua workspace, lint, `expo install --check`, `expo-doctor`. Hanya TypeScript yang menggagalkan job; lint/versi/doctor ditampilkan sebagai peringatan. |
| `eas-build.yml` | manual (Run workflow) | Kirim build Android ke EAS. Pilih `app` (admin/kepala) dan `profile` (preview = APK, production = AAB). |

## Yang perlu disiapkan sekali (di GitHub)
Secrets (Settings → Secrets and variables → Actions → Secrets):
- `EXPO_TOKEN` — token akses dari expo.dev (Account settings → Access tokens).

Variables (tab Variables):
- `EAS_PROJECT_ID_ADMIN`, `EAS_PROJECT_ID_KEPALA` — ID project EAS tiap aplikasi (dibuat di expo.dev lewat "Create project"; slug `family-gathering-admin` dan `family-gathering-kepala`).

Variabel build aplikasi (URL/kunci Supabase, Google Maps) diatur di EAS, bukan di GitHub: lihat `docs/EAS_BUILD.md`.

## Catatan jujur
- Workflow ini **belum pernah dijalankan**. Hasil pertama `check.yml` kemungkinan menampilkan galat TypeScript atau ketidakcocokan versi paket; perbaiki berdasarkan lognya.
- `eas-build.yml` memakai `--no-wait`: job selesai setelah build terkirim. Status dan tautan unduh APK ada di expo.dev → Builds.
- Build pertama biasanya meminta pembuatan keystore Android; dengan `--non-interactive` ini harus dibuat sekali lewat dashboard EAS (Credentials) agar build tidak gagal.
