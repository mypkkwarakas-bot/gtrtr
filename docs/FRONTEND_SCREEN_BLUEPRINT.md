# Screen Blueprint

Spesifikasi layar yang sudah ada di kode. Setiap layar data punya state: loading, berhasil, kosong, error (+ coba lagi), refresh (tarik ke bawah), dan offline (banner global `NetworkStatus`). Backend: lihat `FRONTEND_BACKEND_MAPPING.md`.

## Admin (`apps/admin`) — tab bawah: Beranda · Peserta · Armada · Peta · Kelola

| Layar | Isi dan hierarki | Tindakan | Sumber data |
|---|---|---|---|
| Masuk | logo, judul, email + kata sandi | Masuk (wajib `role=admin`) | Supabase Auth |
| Beranda | hero ringkasan, kartu statistik (peserta, armada, kepala, perjalanan aktif, status lokasi, jadwal/pengumuman terpublikasi, permintaan armada) | tarik untuk menyegarkan | `admin_dashboard()` |
| Peserta | pencarian, filter (Aktif / Belum ada armada / Nonaktif / Semua), daftar | Tambah, buka form | `participants` |
| Form peserta | nama, kode (otomatis dari backend), armada, aktif | Simpan, nonaktifkan (konfirmasi) | `participants`, `gen_participant_code()` |
| Armada | pencarian, daftar dengan ikon | Tambah, buka detail | `fleets` |
| Form armada | nama, pemilih ikon (peringatan pemakaian ganda), aktif | Simpan, nonaktifkan | `fleets` |
| Detail armada | hero ikon + status lokasi, kepala, peserta | tetapkan/ganti/cabut kepala, atur PIN (tampil sekali), akses on/off, minta lokasi terbaru | `get_fleet_detail`, RPC kepala |
| Peta | peta semua armada + destinasi (bila kunci Maps ada), daftar armada dengan status, jarak ke destinasi, umur kontak | buka detail armada; auto-refresh 15 dtk | `get_fleet_map()`, `event_settings` |
| Kelola | menu: Jadwal, Pengumuman, Destinasi, Pengaturan | navigasi | ringkasan jumlah |
| Jadwal / form | daftar urut waktu + chip status; form judul, tanggal, jam mulai/selesai (WIB), lokasi, keterangan, status | Tambah, ubah, hapus (konfirmasi) | `schedules` |
| Pengumuman / form | daftar + chip status; form judul, isi, urutan, status | Tambah, ubah, hapus (konfirmasi) | `announcements` |
| Destinasi | nama, alamat, lat/lng, periksa di Google Maps | Simpan, kosongkan (konfirmasi) | `event_settings` |
| Pengaturan | info kegiatan, tampilkan peta ke peserta, batas tertunda/lama, masa berlaku permintaan lokasi, akun | Simpan, keluar (konfirmasi) | `event_settings` |

## Kepala Rombongan (`apps/kepala`) — tab bawah: Beranda · Peta · Info

| Layar | Isi dan hierarki | Tindakan | Sumber data |
|---|---|---|---|
| Masuk | logo, judul, kode peserta + PIN | Masuk (Edge Function `leader-login`) | `leader-login` |
| Beranda | hero armada (ikon, nama, kepala, status perjalanan), tombol mulai/akhiri, status GPS (aktif/tidak, lokasi terakhir terkonfirmasi server, antrean, galat), kartu izin, daftar peserta | Mulai/akhiri perjalanan (konfirmasi), buka pengaturan, keluar (konfirmasi) | `get_my_assignment`, `start_trip`, `end_trip`, `submit_location` |
| Peta | peta lokasi armada (dari server), destinasi, jejak, status, umur lokasi, jarak, perkiraan tiba (diberi catatan kasar) | navigasi eksternal | `get_fleet_detail` |
| Info | info kegiatan + hitung mundur, pengumuman, jadwal terpublikasi | tarik untuk menyegarkan | `event_settings`, `announcements`, `schedules` |

Izin lokasi: ditolak / GPS mati / izin "Selalu" belum diberikan masing-masing ditampilkan jujur dengan jalan ke pengaturan aplikasi.

## PWA Peserta
Belum dikerjakan (setelah dua aplikasi native terverifikasi).
