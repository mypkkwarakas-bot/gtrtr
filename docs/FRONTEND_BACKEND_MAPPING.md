# Pemetaan Frontend ↔ Backend Supabase

Diaudit langsung lewat **MCP Supabase** pada 2026-10-16 (project `jueiewdtvomivgguosdd`, region ap-southeast-1).
Sumber: skema tabel, `pg_get_functiondef`, `pg_policies`, daftar Edge Function, dan advisor keamanan. Bukan hasil uji dari klien.

## Format respons RPC
Semua RPC mengembalikan `{ ok, code, message, data }` (`public._res`). Klien memakai `rpc()` / `rpcOk()` di `@fg/shared`.

## Autentikasi
| Peran | Cara masuk | Penanda |
|---|---|---|
| Admin | Email + kata sandi (Supabase Auth) | `app_metadata.role = 'admin'` (`is_admin()`); saat audit ada 1 akun admin |
| Kepala Rombongan | Edge Function `leader-login` (POST `{code, pin}`, `verify_jwt=false`) → `setSession` | `app_metadata.role = 'kepala'` |
| Peserta (PWA) | `lookup_participant(p_code)` (anon, tanpa sesi) | kode peserta; diuji 2026-10-16 |

`leader-login`: memverifikasi lewat `verify_leader_login` (rate limit 5 gagal/kode dan 30/IP per 10 menit), membuat akun Auth sekali, merotasi kata sandi acak, lalu mengembalikan `session` + `participant`. Kode gagal: `INVALID_INPUT`, `INVALID_CREDENTIALS`, `RATE_LIMITED`, `SERVER_ERROR`.

## Tabel (RLS aktif di semua tabel)
| Tabel | Baca | Tulis |
|---|---|---|
| `fleets` | anon/authenticated (aktif); admin semua | admin insert/update (tanpa DELETE → nonaktifkan lewat `is_active`) |
| `participants` | admin semua; kepala hanya armadanya | admin insert/update (tanpa DELETE) |
| `fleet_leaders` | admin semua; kepala armadanya | hanya lewat RPC |
| `schedules`, `announcements` | published untuk semua; admin semua | admin insert/update/delete |
| `event_settings` (id=1) | semua | admin update |
| `live_locations` | admin / kepala / peserta bila `show_map_to_participants` | hanya lewat `submit_location` |
| `trips`, `location_requests` | admin / kepala armadanya | hanya lewat RPC |
| `trip_points`, `leader_credentials`, `auth_attempts` | tanpa policy (tertutup untuk klien) | hanya lewat fungsi SECURITY DEFINER |

## RPC yang dipakai
| RPC | Pemanggil | Catatan |
|---|---|---|
| `admin_dashboard()` | Admin | ringkasan + hitungan status lokasi |
| `get_fleet_map()` | Admin, Kepala, PWA | `MAP_DISABLED` bila disembunyikan dari peserta |
| `get_fleet_detail(p_fleet_id)` | Admin, Kepala, PWA | baterai & `last_request` hanya untuk admin/kepala armada itu |
| `assign_fleet_leader` / `unassign_fleet_leader` | Admin | mengakhiri perjalanan aktif bila kepala diganti/dicabut |
| `admin_set_leader_pin(p_participant_id, p_pin?)` | Admin | PIN acak 6 digit bila kosong; PIN hanya dikembalikan sekali |
| `admin_set_leader_access` | Admin | menonaktifkan akses mengakhiri perjalanan aktif |
| `request_fleet_location` | Admin | butuh perjalanan aktif; TTL dari `event_settings` |
| `get_my_assignment()` | Kepala | `NO_ASSIGNMENT` bila akses/penugasan tidak aktif |
| `start_trip()` / `end_trip()` | Kepala | idempoten (`ALREADY_ACTIVE`, `ALREADY_ENDED`) |
| `submit_location(...)` | Kepala | lihat aturan di bawah |
| `get_next_schedule()` | semua | |
| `gen_participant_code()` | Admin | default kolom `participants.code` |
| `lookup_participant`, `request_fleet` | PWA (anon) | rate limit 20 gagal/10 mnt per klien; `request_fleet` hanya mencatat `requested_fleet_id`, tidak mengubah `fleet_id` resmi. Diuji (rollback) 2026-10-16 |

### Aturan `submit_location`
Parameter: `p_trip_id, p_lat, p_lng, p_accuracy, p_recorded_at, p_speed, p_heading, p_battery_pct`.
Ditolak: koordinat di luar rentang atau (0,0) `INVALID_COORDINATES`; `p_recorded_at` kosong atau >2 menit di depan `INVALID_TIMESTAMP`; lebih tua dari 15 menit `LOCATION_TOO_OLD`; kecepatan >100 m/s `INVALID_SPEED`; trip bukan milik armada `TRIP_NOT_FOUND`; trip selesai `TRIP_ENDED`.
`ok=true` tetapi `data.saved=false` (`IGNORED_OLDER`) berarti lokasi tidak lebih baru dari yang tersimpan — **jangan** ditampilkan sebagai "tersimpan". Antrean offline harus mengirim urut `recorded_at` dan membuang item >15 menit.

## Realtime
Publikasi `supabase_realtime` memuat: `event_settings, fleets, live_locations, location_requests, schedules, announcements`.

## Temuan audit
- Pertanyaan checkpoint 5 terjawab: policy `fl_select` mengizinkan **admin SELECT `fleet_leaders`**, jadi `LEADERS_KEY` aman.
- Advisor keamanan: peringatan "SECURITY DEFINER dapat dieksekusi anon/authenticated" bersifat disengaja; tiap fungsi admin memeriksa `is_admin()` sendiri. Peringatan lain: perlindungan kata sandi bocor (leaked password) belum aktif di Auth — disarankan diaktifkan di dashboard Supabase.
- Saat audit data masih kosong: 0 armada, 0 peserta, `event_settings` belum terisi nama/tujuan. Uji klien butuh data nyata dari Admin.
- Status PIN/akses tidak terbaca Admin (`leader_credentials` tertutup).

## PWA Peserta (2026-10-16)
Membaca lewat `anon`: `event_settings`, `announcements`/`schedules` (published), `fleets` (aktif), RPC `get_fleet_map`. Diverifikasi langsung: `participants` tidak terbaca anon. Detail: `PWA_PESERTA.md`.
