# Design System — FAMILY GATHERING · KLKM JAKARTA UTARA

Sumber kebenaran kode: `packages/shared/src/theme/tokens.ts` dan `typography.ts`. Dokumen ini menjelaskan aturannya; jika berbeda, kode yang berlaku.

## Karakter
Premium, hangat, mudah dipakai di lapangan. Dasar ivory (bukan putih menyilaukan), emerald dalam sebagai warna utama, champagne gold hanya aksen, teks navy/charcoal berkontras tinggi. Efek glossy hanya pada **HeroCard** (satu per layar); kartu lain datar dengan bayangan lembut.

## Warna
| Peran | Token | Hex |
|---|---|---|
| Latar layar | `ivory` / `ivorySunken` | #FAF6EC / #F2ECDC |
| Permukaan kartu | `surface` | #FFFDF8 |
| Utama | `emerald900/800/700/600/500` | #0A3328 … #2A8F70 |
| Latar lembut utama | `emerald100/50` | #D6EADF / #ECF5F0 |
| Aksen (terbatas) | `gold700/500/300/100` | #7A5C12 / #C9A24B / #E4CD8F / #F6ECCD |
| Teks | `ink` / `inkSoft` / `inkMuted` / `inkFaint` | #14202B / #34414E / #5B6672 / #8A94A0 |
| Garis | `line` / `lineStrong` | #E5DDC9 / #D3C9AE |
| Status | `success`, `warning`, `danger`, `neutral`, `info` (+`…Bg`) | lihat tokens |

Aturan: status **selalu** ikon + label, tidak hanya warna. Emas dipakai untuk label kecil, judul seksi, dan penanda destinasi; bukan untuk tombol utama.

## Tipografi
Satu keluarga: Plus Jakarta Sans (400/600/700/800).

| Varian | Ukuran/line | Pemakaian |
|---|---|---|
| `display` | 32/38, 800 | judul hero, layar masuk |
| `title` | 24/30, 800 | judul header layar |
| `h2` / `h3` | 18/24, 16/22, 700 | judul seksi/kartu |
| `body` / `bodyStrong` | 15/22, 400 / 600 | isi, nama item |
| `caption` | 13/18 | keterangan, waktu |
| `label` | 12/16, 700, kapital, spasi 0,8 | penanda kecil (emas) |
| `stat`, `statLarge`, `value` | 28, 44, 16, angka tabular | statistik |

Tidak ada teks di bawah 12 sp; isi minimal 15 sp. Layout harus tetap utuh pada font scale besar.

## Spacing, radius, elevation
- Spacing: 2, 4, 8, 12, 16, 20, 24, 32, 40, 56 (`xxs`…`giant`). Padding layar 16–20; jarak antar kartu 12–16.
- Radius: kecil 10, tombol/input 14, kartu 20, dialog 24, sheet/hero 28, chip penuh.
- Elevation: `e1` kartu, `e2` elemen mengambang, `e3` sheet/dialog. Bayangan bertinta emerald gelap, lembut.
- Target sentuh utama minimal 48 dp (`HIT`).

## Komponen (`@fg/shared`)
| Komponen | Aturan |
|---|---|
| `PrimaryButton` | satu tindakan utama per area; `danger` untuk tindakan destruktif; `loading` mengunci ulang tekan |
| `SecondaryButton` | tindakan pendamping; `danger` untuk hapus/nonaktifkan/keluar |
| `IconButton` | wajib punya `label` aksesibilitas |
| `FormField` / `SearchField` | label di atas, pesan error di bawah dengan ikon, hint bila tidak ada error |
| `PremiumCard` | kartu standar, bayangan `e1` |
| `HeroCard` | satu per layar, gradient emerald + highlight |
| `StatCard` | angka besar + hint |
| `StatusChip` | menerima `meta {label, tone, icon}` dari `trackingStatusMeta` / `publishStatusMeta` |
| `MenuRow` | baris menu: ikon, judul, keterangan, panah |
| `ConfirmationSheet` | wajib untuk hapus, nonaktifkan, akhiri perjalanan, keluar, buang perubahan |
| `AppHeader` | judul + subjudul + tombol kembali opsional |
| `LoadingState`, `EmptyState`, `ErrorState` | tiga state standar setiap layar data |
| `ToastProvider` / `useToast` | umpan balik singkat `success | error | info` setelah operasi |
| `NetworkStatus` | banner offline global |
| `FleetIcon` / `FleetIconPicker` | ikon bus pilihan Admin (bus-1…bus-8) |

## Pola umum
- **Form:** validasi di klien (pesan Indonesia), error dari backend ditampilkan di atas tombol Simpan, panduan "buang perubahan?" saat keluar dengan data belum disimpan, tombol destruktif terpisah di bawah.
- **Daftar:** pencarian bila relevan, tarik-untuk-menyegarkan, empty state yang menjelaskan langkah berikutnya.
- **Tanggal/jam:** input teks WIB berformat `TTTT-BB-HH` dan `JJ:MM` dengan validasi (tanpa dependensi picker native).
- **Status konten:** Draf / Terpublikasi / Diarsipkan (`StatusPicker`).
- **Tidak ada sukses palsu:** pesan berhasil hanya setelah backend mengonfirmasi (RPC `ok=true`, atau update tabel yang benar-benar mengubah baris — `assertAffected`).
