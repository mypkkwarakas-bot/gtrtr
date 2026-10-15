# CHECKPOINT 5 — Family Gathering KLKM Jakarta Utara

Diperbarui: 2026-10-16 (checkpoint 6). Status: **pekerjaan masih berjalan, belum bisa dibuild, belum pernah dikompilasi.**

## Keputusan
- Ikon armada dipilih oleh **Admin** untuk tiap armada. Nama file asset_armada (5–12) hanya nama file, bukan aturan pemetaan.
- Ikon disimpan di backend (`fleets.icon_key`, nilai `bus-1`..`bus-8`) supaya Kepala Rombongan melihat ikon yang sama.

## Backend (sudah diterapkan ke Supabase jueiewdtvomivgguosdd)
- Migrasi `fleets_icon_key`: kolom `fleets.icon_key text null` + check `^bus-[1-8]$`.
- RPC `get_fleet_map`, `get_fleet_detail`, `get_my_assignment` sekarang mengembalikan `icon_key` (terverifikasi lewat pg_get_functiondef).
- Admin menyimpan pilihan lewat update tabel `fleets` (policy update admin yang sudah ada) — **belum diuji dari klien**.

## SELESAI ditulis (belum dikompilasi/diuji)
- Aset: ikon + splash Admin & Kepala, 8 ilustrasi bus (`packages/shared/assets/buses/bus-1..8.png`), logo in-app.
- Root: package.json (npm workspaces), eslint.config.js, .gitignore, .env.example
- `packages/shared` (`@fg/shared`):
  - theme/tokens.ts, theme/typography.ts
  - lib/: secureStorage, supabase, errors, rpc, types (sudah ada `icon_key`), dates, validation, status, fleetStyle (pilihan Admin, `busImageFor(iconKey)` -> null bila belum dipilih), maps
  - ui/: AppText, PrimaryButton, SecondaryButton, IconButton, StatusChip, PremiumCard, HeroCard, StatCard, SectionHeader, LoadingState, EmptyState, ErrorState, FleetIcon, FleetIconPicker
  - src/index.ts (barrel). Kemungkinan ada bentrok nama export antar modul: cek saat `tsc` pertama.

## SELESAI di sesi lanjutan (belum dikompilasi/diuji)
- shared/ui tambahan: FormField, SearchField, ConfirmationSheet, ToastProvider/useToast, AppHeader, NetworkStatus/useIsOnline
- apps/admin: package.json, app.config.ts (package `com.gathering.com.admin` — diganti sesuai permintaan user (base `com.gathering.com`)), eas.json (development/preview APK/production AAB), tsconfig, babel
- apps/admin/src: supabase.ts, auth.tsx (email+password, wajib app_metadata.role=admin), fleets.ts (CRUD tabel fleets + iconUsage)
- apps/admin/app: _layout (Stack.Protected, splash, font), login, (tabs)/_layout, (tabs)/index (dashboard via admin_dashboard), (tabs)/armada (daftar+cari), armada/form (tambah/ubah, pemilih ikon Admin, nonaktifkan dengan konfirmasi, guard perubahan belum disimpan)
- apps/kepala: baru package.json, app.config.ts (izin lokasi + background location + foreground service, plugin expo-location/task-manager; package `com.gathering.com.kepala`), eas.json, tsconfig, babel. Belum ada kode di src/ dan app/.

## SELESAI tambahan (checkpoint 5, belum dikompilasi/diuji)
- Admin Peserta: tab Peserta (cari nama/kode, filter Aktif/Belum ada armada/Nonaktif/Semua), form tambah/ubah (kode otomatis dari backend `gen_participant_code()`, pilih armada, nonaktifkan dengan konfirmasi, guard perubahan belum disimpan). src/participants.ts
- Admin Detail armada `armada/[id]`: hero ikon, status lokasi (get_fleet_detail), tetapkan/ganti kepala (assign_fleet_leader, daftar peserta memenuhi syarat), cabut penugasan (unassign_fleet_leader; konsekuensi dijelaskan), atur PIN (admin_set_leader_pin, PIN tampil sekali saja), aktif/nonaktif akses (admin_set_leader_access), minta lokasi terbaru (request_fleet_location, label jujur). src/leaders.ts
- Catatan backend: assign_fleet_leader menolak peserta di armada lain / sudah jadi kepala armada lain / nonaktif; unassign & nonaktifkan akses mengakhiri perjalanan aktif.
- **Belum diuji**: apakah RLS mengizinkan admin SELECT tabel `fleet_leaders` (dipakai LEADERS_KEY). Bila ditolak, ganti sumber id kepala (mis. tambahkan `leader_participant_id` ke get_fleet_detail).

## BELUM dikerjakan (urut prioritas)
0. (Sisa dari daftar di bawah; item yang sudah tercantum di "SELESAI di sesi lanjutan" tidak perlu diulang)
1. packages/shared/ui: FormField, SearchField, ConfirmationSheet, ActionSheet, Toast/banner, NetworkStatus, LocationStatus, ParticipantRow, ScheduleCard, AnnouncementCard, AppHeader, SkeletonLoader
2. Verifikasi versi paket (`npx expo install --check`), tambahkan ActionSheet, SkeletonLoader, ParticipantRow, ScheduleCard, AnnouncementCard, LocationStatus
3. Fondasi Kepala: auth leader-login, provider, layout
4. Admin: login (email+password), dashboard, peserta (CRUD + nonaktifkan), armada (detail: kepala+peserta+lokasi, penugasan kepala), penugasan kepala, kode akses/PIN, jadwal, pengumuman, destinasi (event_settings id=1), peta global, detail armada, pengaturan
5. Kepala: login (leader-login), dashboard, mulai/akhiri perjalanan, daftar peserta, destinasi+peta, jadwal, pengumuman, status GPS
6. Background GPS (expo-location + expo-task-manager + foreground service) -> submit_location
7. .github/workflows (EAS Build manual dispatch), 10 dokumen docs/*.md
8. QA: `npm install`, `tsc`, lint, `expo-doctor`, build preview APK, uji perangkat fisik

## Catatan penting
- Celah backend: `leader_credentials` tidak terbaca admin, jadi status PIN/akses tidak bisa ditampilkan.
- Tidak ada policy DELETE untuk participants/fleets: "hapus" = nonaktifkan (`is_active=false`).
- Lingkungan kerja tidak punya akses npm: versi paket (Expo SDK 54) belum diverifikasi. Jalankan `npm install` lalu `npx expo install --check` di tiap app.
- Jangan pernah menaruh service-role key di aplikasi.

## Checkpoint 6 (2026-10-16) — audit MCP Supabase + fondasi Kepala
- Backend diaudit ulang lewat MCP: tipe `types.ts` cocok dengan RPC aktual. Hasil lengkap: `docs/FRONTEND_BACKEND_MAPPING.md`.
- Terjawab: admin boleh SELECT `fleet_leaders` (policy `fl_select`).
- Ditulis (belum dikompilasi/diuji): apps/kepala `src/supabase.ts`, `src/auth.tsx` (Edge Function `leader-login` → `setSession`, cek `role=kepala`, verifikasi `get_my_assignment`), `app/_layout.tsx`, `app/login.tsx`, `app/index.tsx` (penugasan + peserta + keluar).
- Berikutnya: mulai/akhiri perjalanan (`start_trip`/`end_trip`), destinasi+peta, jadwal, pengumuman, lalu background GPS → `submit_location`.

## Checkpoint 7 (2026-10-16) — perjalanan + GPS Kepala (belum dikompilasi/diuji)
- apps/kepala/src/tracking.ts: task `expo-task-manager` + `expo-location` (foreground service), kirim ke `submit_location` urut `recorded_at`, antrean memori (maks 120, buang >14 menit; hilang bila app dimatikan paksa), berhenti otomatis pada TRIP_ENDED/NO_ASSIGNMENT/TRIP_NOT_FOUND, "tersimpan" hanya bila `data.saved=true`.
- app/index.tsx: mulai/akhiri perjalanan (izin lokasi dulu → start_trip → mulai GPS; gagal → end_trip), sinkron GPS dengan `active_trip` server (pemulihan setelah buka ulang), status GPS jujur, keluar menghentikan GPS.
- Baterai: `p_battery_pct` dikirim null (expo-battery belum ditambahkan).
- Belum: peta+destinasi, jadwal, pengumuman (layar Kepala), docs/*.md lain, workflow GitHub Actions, QA & uji perangkat fisik (background/layar terkunci/izin dicabut/force-stop).

## Checkpoint 8 (2026-10-16) — layar info Kepala + workflow (belum dikompilasi/diuji)
- apps/kepala sekarang bertab: `(tabs)/index` (beranda+perjalanan+GPS), `(tabs)/peta` (get_fleet_detail armada sendiri: marker lokasi server, destinasi, jejak, jarak, navigasi eksternal; fallback tanpa kunci Maps), `(tabs)/info` (event_settings, pengumuman terpublikasi, jadwal terpublikasi). src/info.ts.
- .github/workflows: `check.yml` (typecheck/lint/expo check/doctor), `eas-build.yml` (manual, admin|kepala, preview|production, --no-wait).
- docs: FRONTEND_BACKEND_MAPPING, GITHUB_ACTIONS, EAS_BUILD. Masih kurang: FRONTEND_DESIGN_SYSTEM, FRONTEND_SCREEN_BLUEPRINT, TEST_CHECKLIST, IMPLEMENTATION_STATUS, dll.
- Admin belum: dashboard sudah, tapi jadwal, pengumuman, destinasi (event_settings id=1), peta global, pengaturan.

## Checkpoint 9 (2026-10-16) — UI frontend native selesai ditulis (belum dikompilasi/diuji)
- Admin: tab Peta (get_fleet_map + destinasi, status dihitung ulang klien dgn liveTrackingStatus, auto-refresh 15 dtk) dan Kelola; layar jadwal (list+form), pengumuman (list+form), destinasi, pengaturan (info kegiatan, toggle peta peserta, ambang status, akun/keluar). Semua rute terdaftar di app/_layout.tsx.
- Shared: validateDateInput/TimeInput + parse*, MenuRow, assertAffected (cegah sukses palsu pada update/delete tabel; dipakai juga di fleets/participants). Admin: StatusPicker, content.ts.
- Perbaikan: guard "buang perubahan" di form armada/peserta memakai nilai dirty basi setelah simpan -> kini pakai ref.
- Docs: FRONTEND_DESIGN_SYSTEM.md, FRONTEND_SCREEN_BLUEPRINT.md.
- Verifikasi yang benar-benar dijalankan: cek sintaks TypeScript 63 file (tanpa error sintaks). Cek tipe penuh, lint, build, uji perangkat BELUM (tidak ada node_modules/npm).
- Sisa: docs (TEST_CHECKLIST, IMPLEMENTATION_STATUS, dll), PWA Peserta, QA lewat workflow check.yml.

## Checkpoint 10 (2026-10-16) — PWA Peserta + dokumen + verifikasi backend
- apps/peserta-pwa (React+Vite+Leaflet) lengkap; workflow pwa.yml; netlify.toml/vercel.json; docs: PWA_PESERTA, ANDROID_BACKGROUND_GPS, TEST_CHECKLIST, IMPLEMENTATION_STATUS; README root.
- Kontrak anon diuji ke Supabase (rollback). Perbaikan: sanitasi nilai sensor GPS di tracking.ts.
- npm diblokir di lingkungan ini: install/tsc/build belum jalan. Langkah berikut ada di docs/IMPLEMENTATION_STATUS.md.
