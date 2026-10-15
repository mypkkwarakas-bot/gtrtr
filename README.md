# FAMILY GATHERING — KLKM JAKARTA UTARA

Tiga aplikasi dengan **satu backend Supabase**:

| Aplikasi | Folder | Teknologi | Peran |
|---|---|---|---|
| Admin | `apps/admin` | Expo + React Native + TS (Android native) | Kelola peserta, armada, kepala, jadwal, pengumuman, destinasi; pantau peta |
| Kepala Rombongan | `apps/kepala` | Expo + React Native + TS (Android native) | Mulai/akhiri perjalanan, kirim GPS aktual, info kegiatan |
| Peserta | `apps/peserta-pwa` | React + Vite (PWA) | Lihat informasi, jadwal, pengumuman, peta (hanya membaca) |
| Bersama | `packages/shared` (`@fg/shared`) | TS/RN | Tema, komponen UI, klien Supabase, tipe, util (dipakai dua app Android) |

Backend: project Supabase `jueiewdtvomivgguosdd` (ap-southeast-1) — skema, RLS, RPC, Edge Function `leader-login`. Sumber kebenaran kontrak: `docs/FRONTEND_BACKEND_MAPPING.md` (diaudit langsung ke Supabase).

## Mulai
```bash
cp .env.example apps/admin/.env && cp .env.example apps/kepala/.env      # isi URL + kunci publishable (+ Google Maps key)
cp apps/peserta-pwa/.env.example apps/peserta-pwa/.env
npm install            # lalu commit package-lock.json
npm run typecheck
npm run admin          # Expo dev client (butuh development build, bukan Expo Go)
npm run kepala
npm run pwa
```

## Build & deploy
- Android (Admin/Kepala): GitHub Actions `EAS Build Android` → `docs/EAS_BUILD.md`, `docs/GITHUB_ACTIONS.md`.
- PWA: hosting statis HTTPS (`netlify.toml`/`vercel.json` tersedia) → `docs/PWA_PESERTA.md`.
- Kualitas: workflow `Cek kode` (typecheck, lint, expo check/doctor) dan `PWA Peserta (build)`.

## Dokumentasi
`docs/FRONTEND_DESIGN_SYSTEM.md`, `FRONTEND_SCREEN_BLUEPRINT.md`, `FRONTEND_BACKEND_MAPPING.md`, `ANDROID_BACKGROUND_GPS.md`, `EAS_BUILD.md`, `GITHUB_ACTIONS.md`, `PWA_PESERTA.md`, `TEST_CHECKLIST.md`, `IMPLEMENTATION_STATUS.md`. Pedoman kerja asli: `README_FAMILY_GATHERING_KLKM_JAKARTA_UTARA.md`.

## Prinsip
Tanpa data demo, mock API, atau GPS simulasi. Sukses hanya ditampilkan setelah backend mengonfirmasi. **Jangan pernah** menaruh `service_role` key di aplikasi mana pun. Variabel yang ditanam ke klien (`EXPO_PUBLIC_*`, `VITE_*`) dapat dilihat pengguna.

## Status
Kode lengkap ditulis, tetapi **belum pernah dikompilasi, dibuild, atau diuji di perangkat**. Lihat `docs/IMPLEMENTATION_STATUS.md` untuk status jujur dan langkah menuju rilis.
