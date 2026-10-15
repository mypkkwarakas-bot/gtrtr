# Status implementasi

Diperbarui 2026-10-16. Definisi: **Diimplementasikan** = kode ditulis · **Diuji** = tes benar-benar dijalankan · **Build berhasil** = proses build selesai · **Belum diverifikasi** = belum ada bukti.

## Ringkasan
| Area | Diimplementasikan | Diuji / diverifikasi |
|---|---|---|
| Backend Supabase (skema, RLS, RPC, `leader-login`) | Ya (sudah ada) | Diaudit lewat MCP; kontrak PWA diuji langsung (lihat bawah) |
| Admin Android | Semua layar lingkup (login, dashboard, peserta, armada+detail, kepala/PIN/akses, jadwal, pengumuman, destinasi, peta, pengaturan) | Hanya cek sintaks + cek semantik parsial. Belum dikompilasi/dijalankan |
| Kepala Rombongan Android | Login, beranda+perjalanan, GPS background, peta, jadwal, pengumuman | Sama; GPS belum diuji di perangkat |
| PWA Peserta | Identitas, beranda, countdown, pengumuman, jadwal, peta, info, instal/PWA | Kontrak RPC/RLS diuji; UI belum dibuild/dijalankan |
| EAS + GitHub Actions | `eas.json`, `check.yml`, `eas-build.yml`, `pwa.yml` | Belum pernah dijalankan |
| Dokumentasi | Semua dokumen tersedia | — |

## Yang benar-benar dijalankan
1. Audit Supabase (2026-10-16): tabel, policy, RPC, Edge Function, advisor.
2. Uji langsung ke database (transaksi di-**rollback**, data tetap kosong) sebagai peran `anon`: `lookup_participant` (benar/salah), `request_fleet`, `get_fleet_map` (termasuk `icon_key`), `announcements` dan `schedules` hanya yang `published`, `fleets` aktif terbaca, `event_settings` terbaca, `participants` **tidak** terbaca (izin ditolak).
3. Pemeriksaan TypeScript semantik parsial seluruh repo (78 file) tanpa paket pihak ketiga: tidak ada nama tak terdefinisi/ekspor hilang pada kode lokal; temuan yang tersisa hanya akibat paket/`@types` belum terpasang.
4. Perbaikan dari audit kode: nilai sensor GPS negatif/di luar rentang dikirim `null` (agar tidak ditolak CHECK backend).

## Tidak dapat dilakukan di lingkungan pembuatan
Registry npm diblokir (403 kebijakan egress), sehingga `npm install`, `tsc` penuh, lint, `expo-doctor`, `vite build`, dan EAS Build **belum dijalankan**. Tidak ada `package-lock.json`; versi paket (Expo SDK 54 dsb.) belum diverifikasi terhadap registry.

## Langkah menuju siap deploy (urut)
1. Push repo ke GitHub → jalankan `Cek kode`; perbaiki galat TypeScript/versi paket dari lognya; commit `package-lock.json`.
2. Isi variabel/rahasia: GitHub `EXPO_TOKEN`, Variables `EAS_PROJECT_ID_ADMIN/KEPALA`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`; EAS env (lihat `EAS_BUILD.md`); Google Maps key.
3. Backend: aktifkan *Leaked password protection*; pastikan ada akun admin; isi data awal lewat aplikasi Admin.
4. Jalankan `EAS Build Android` (preview) untuk Admin dan Kepala; pasang APK; jalankan `TEST_CHECKLIST.md` termasuk uji GPS fisik.
5. Deploy PWA ke hosting HTTPS (`PWA_PESERTA.md`); uji instalasi.
6. Production AAB bila diperlukan.

## Masalah/keterbatasan yang diketahui
- Status PIN/akses kepala tidak terbaca Admin (`leader_credentials` tertutup, sesuai desain backend).
- Tidak ada kebijakan DELETE untuk peserta/armada: "hapus" = nonaktifkan.
- Baterai tidak dikirim (`p_battery_pct=null`). Antrean offline hanya di memori.
- Peta PWA memakai tile OpenStreetMap publik (cukup untuk satu acara; ganti penyedia bila trafik tinggi).
- Warning advisor "SECURITY DEFINER dapat dieksekusi" bersifat disengaja (tiap fungsi admin memeriksa `is_admin()`).
