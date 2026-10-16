# Login Kepala dengan PIN saja — SUDAH DITERAPKAN di backend

Diterapkan ke Supabase `jueiewdtvomivgguosdd` (2026-10-16) lewat MCP:
- Migrasi `leader_login_pin_only`: fungsi baru `verify_leader_pin(p_pin, p_client_key)` (hanya `service_role`) yang membandingkan PIN ke semua kredensial kepala aktif (bcrypt; jumlah kepala kecil). Gagal → `INVALID_CREDENTIALS`; PIN sama dipakai >1 kepala aktif → `PIN_AMBIGUOUS`; batas 30 gagal per IP per 10 menit (`RATE_LIMITED`, sama seperti sebelumnya).
- `admin_set_leader_pin` kini menjamin PIN **unik** di antara kepala aktif (PIN acak diulang sampai unik; PIN manual yang bentrok ditolak `PIN_IN_USE`). PIN 6–12 digit angka.
- Edge Function `leader-login` v2: body `{ "pin": "..." }`.
- Diuji di database (transaksi di-rollback): PIN benar → OK, PIN salah → INVALID_CREDENTIALS, PIN ganda → PIN_AMBIGUOUS. Belum diuji end-to-end dari app/HTTP.

Catatan: fungsi lama `verify_leader_login(kode, PIN)` masih ada tetapi tidak dipakai lagi.
Batasan: bila akses kepala yang dinonaktifkan diaktifkan lagi dan PIN-nya sama dengan kepala aktif lain, login keduanya ditolak `PIN_AMBIGUOUS` sampai Admin membuat PIN baru.
