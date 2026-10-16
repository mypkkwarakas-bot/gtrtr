# Family Gathering KLKM Jakarta Utara — Aplikasi Native (Admin + Kepala Rombongan)

Repo **terpisah** untuk satu aplikasi Android (Expo + React Native + TypeScript). **Admin** dan **Kepala Rombongan** memakai app yang sama; yang membedakan adalah **login**:

| Peran | Login | Area |
|---|---|---|
| Kepala Rombongan | PIN yang didaftarkan Admin (Edge Function `leader-login`) | `app/kepala/*` — mulai/akhiri perjalanan, GPS, peta, info |
| Admin | email + kata sandi (Supabase Auth) | `app/admin/*` — peserta, armada, kepala, jadwal, pengumuman, destinasi, peta, pengaturan |

Peran dibaca dari `app_metadata.role` pada sesi (ditetapkan server), lalu `app/_layout.tsx` (`Stack.Protected`) hanya membuka area yang sesuai.

PWA peserta ada di repo lain: `family-gathering-peserta-pwa`. Backend: project Supabase `jueiewdtvomivgguosdd`.

## Struktur
```
app/            expo-router: login, index (redirect), admin/*, kepala/*
src/            supabase, auth (terpadu), admin/*, kepala/* (tracking GPS, info)
shared/         tema, komponen UI, klien Supabase, tipe, util (alias @fg/shared via tsconfig paths)
docs/           kontrak backend, desain, EAS, Actions, checklist uji
```

## Mulai
```bash
# isi kunci publishable di src/config.ts
npm install              # lalu commit package-lock.json
npm run typecheck
npm start                # butuh development build (bukan Expo Go)
```

## Build
Ringkas: `docs/RILIS_MVP.md`. GitHub Actions `EAS Build Android` → `docs/EAS_BUILD.md`, `docs/GITHUB_ACTIONS.md`. Package Android: `com.gathering.com`; project Expo `wings445/wings545`.

## Prinsip
Tanpa data demo/mock/GPS simulasi. Sukses hanya ditampilkan setelah backend mengonfirmasi. **Jangan pernah** menaruh `service_role` key di aplikasi.

## Status
Kode lengkap ditulis, **belum pernah dikompilasi, dibuild, atau diuji di perangkat**; setelah penggabungan dua app ini pun belum. Lihat `docs/IMPLEMENTATION_STATUS.md`.
