# FAMILY GATHERING --- KLKM JAKARTA UTARA

**Pedoman utama pengembangan frontend, integrasi backend, dan
pengujian**

Dokumen ini menjadi acuan kerja untuk membangun tiga aplikasi yang
saling terintegrasi:

1.  **Admin** --- aplikasi Android native untuk mengelola kegiatan dan
    memantau armada.
2.  **Kepala Rombongan** --- aplikasi Android native untuk menjalankan
    tugas armada dan mengirim posisi GPS aktual.
3.  **Peserta** --- Progressive Web App (PWA) untuk melihat informasi
    kegiatan, jadwal, destinasi, dan peta perjalanan.

Ketiganya menggunakan **satu backend Supabase bersama**. PWA Peserta
dikerjakan setelah kedua aplikasi Android native siap.

> **Sumber kebenaran integrasi:** dokumentasi backend Supabase yang
> disertakan dalam proyek. Nama tabel, kolom, relasi, RPC, Edge
> Functions, aturan akses, dan format respons harus mengikuti
> dokumentasi tersebut serta diverifikasi terhadap implementasi aktual
> jika akses tersedia.

------------------------------------------------------------------------

## 1. Tujuan dan prinsip proyek

Aplikasi dibuat untuk mendukung satu kegiatan Family Gathering, sehingga
solusi harus praktis dan cukup andal untuk digunakan di lapangan---tanpa
arsitektur berlebihan yang tidak diperlukan.

### Prinsip wajib

-   Fitur harus nyata dan terhubung ke backend; bukan prototype visual.
-   Jangan menggunakan data demo, mock API, koordinat GPS simulasi, atau
    pesan sukses palsu.
-   Jangan mengarang nama tabel, kolom, endpoint, RPC, maupun aturan
    bisnis.
-   Jangan menganggap operasi berhasil sebelum mendapat konfirmasi yang
    sesuai dari backend.
-   Jangan menyimpan salinan data lokal sebagai pengganti database.
-   Penyimpanan lokal hanya boleh digunakan untuk kebutuhan yang memang
    sesuai, misalnya preferensi UI atau antrean lokasi offline yang
    dirancang dengan benar.
-   Gunakan bahasa Indonesia yang jelas, alami, dan mudah dipahami.
-   Prioritaskan stabilitas, kemudahan penggunaan, keterbacaan, serta
    build Android yang dapat direproduksi.
-   Keamanan harus proporsional: tetap gunakan autentikasi, otorisasi,
    RLS, dan perlindungan kredensial yang benar, tanpa menambahkan
    kompleksitas yang tidak dibutuhkan.
-   Dokumentasikan keterbatasan atau fitur yang belum dapat
    diverifikasi. Jangan menyatakan pengujian berhasil jika belum
    dilakukan.

## 2. Gambaran sistem

``` text
                 ┌──────────────────────────┐
                 │     Supabase Backend     │
                 │ Auth / DB / RLS / RPC /  │
                 │ Realtime / Storage*      │
                 └────────────┬─────────────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
   ┌─────────▼────────┐ ┌─────▼──────────┐ ┌───▼──────────────┐
   │ Admin Android    │ │ Kepala         │ │ Peserta PWA      │
   │ Expo + RN        │ │ Rombongan      │ │ React Web        │
   │                  │ │ Expo + RN      │ │                  │
   │ Kelola kegiatan  │ │ GPS aktual     │ │ Lihat informasi  │
   │ dan pantau peta  │ │ dan operasional│ │ dan peta         │
   └──────────────────┘ └────────────────┘ └──────────────────┘
```

`Storage*` hanya digunakan jika memang dibutuhkan oleh kontrak backend.

### Tanggung jawab setiap aplikasi

  -----------------------------------------------------------------------
  Aplikasi                Peran utama             Sumber lokasi GPS
  ----------------------- ----------------------- -----------------------
  Admin Android           Mengelola data kegiatan Membaca data lokasi
                          dan memantau semua      dari backend
                          armada                  

  Kepala Rombongan        Mengelola perjalanan    Perangkat kepala
  Android                 armadanya dan mengirim  rombongan
                          lokasi                  

  Peserta PWA             Melihat informasi       Membaca data lokasi
                          kegiatan dan peta       dari backend; bukan
                                                  pengirim GPS
  -----------------------------------------------------------------------

Semua aplikasi harus membaca destinasi dan informasi bersama dari sumber
backend yang sama agar tidak ada perbedaan data antar-aplikasi.

------------------------------------------------------------------------

# 3. Pedoman desain dan pengalaman pengguna

## 3.1 Karakter desain

Desain tidak boleh terlihat seperti template dashboard generik atau
halaman CRUD standar. Bangun identitas visual khusus **FAMILY GATHERING
--- KLKM JAKARTA UTARA** yang premium, modern, hangat, dan mudah dipakai
di lapangan.

Arah visual:

-   Dasar warna ivory/off-white yang nyaman, bukan putih menyilaukan.
-   Deep emerald atau forest green sebagai warna utama.
-   Champagne gold atau warm amber sebagai aksen terbatas.
-   Teks deep navy/charcoal dengan kontras tinggi.
-   Permukaan glossy yang halus, highlight terkontrol, dan gradient yang
    memiliki tujuan visual.
-   Sudut membulat konsisten, elevation/shadow lembut, ikon konsisten,
    dan animasi mikro yang ringan.
-   Tipografi tegas dan mudah dibaca; hindari font tipis atau teks
    terlalu kecil.
-   Gunakan variasi komposisi yang disengaja: hero section, status
    perjalanan, statistik, daftar, agenda, dan tindakan cepat.
-   Jangan memberi gradient, blur, shadow, atau efek glossy berlebihan
    pada semua elemen.
-   Jangan memakai sidebar desktop pada aplikasi Android.

**Sebelum membuat semua layar**, tetapkan design system yang konkret:
kode warna, skala tipografi, spacing, radius, elevation, aturan ikon,
gaya tombol, input, kartu, dialog, bottom sheet, dan status. Simpan
aturan ini di `docs/FRONTEND_DESIGN_SYSTEM.md`.

Buat pula `docs/FRONTEND_SCREEN_BLUEPRINT.md` yang merinci struktur
visual, hierarki konten, tindakan, navigasi, dan state untuk setiap
layar. Gunakan blueprint sebagai spesifikasi implementasi, bukan sebagai
hasil akhir pengganti kode.

## 3.2 Standar layar

Setiap halaman yang mengambil atau mengubah data harus memiliki state
yang sesuai:

-   Loading.
-   Berhasil menampilkan data.
-   Empty state jika belum ada data.
-   Error state dengan penjelasan yang dapat dipahami.
-   Refresh state jika mendukung penyegaran.
-   Offline state jika relevan.
-   Permission state untuk fitur perangkat.

Setiap tombol harus menjalankan tindakan nyata atau tidak ditampilkan.
Hindari tombol tanpa `onPress`, tautan kosong, menu kosong, serta pesan
"Coming Soon" untuk fitur yang masuk ruang lingkup.

Pastikan layout bekerja pada layar Android kecil maupun besar, dengan
safe area, keyboard, status bar, navigation bar, font scale, dan Android
Back diperhitungkan. Target sentuh utama idealnya minimal sekitar 48 dp.

------------------------------------------------------------------------

# 4. Aplikasi 1 --- Admin Android Native

## 4.1 Teknologi dan peran

-   **Expo + React Native + TypeScript**.
-   Aplikasi Android native; bukan WebView dan bukan website yang
    dibungkus.
-   Navigasi mobile-first tanpa sidebar desktop.
-   Supabase sebagai sumber data.
-   Build melalui EAS Build dan GitHub Actions.

Admin adalah pusat kendali kegiatan. Dashboard harus memberikan
ringkasan operasional dan akses cepat, bukan menumpuk semua formulir di
satu layar.

## 4.2 Fitur Admin wajib

### A. Autentikasi dan sesi

-   Login menggunakan metode yang benar-benar didukung backend.
-   Menampilkan loading dan pesan kesalahan yang mudah dimengerti.
-   Memulihkan sesi sesuai kemampuan mekanisme autentikasi yang
    digunakan.
-   Logout dengan benar dan membersihkan state autentikasi yang relevan.
-   Tidak menanam kredensial server di aplikasi.

Jangan mengasumsikan metode login tertentu sebelum memeriksa dokumentasi
backend.

### B. Dashboard operasional

Tampilkan ringkasan yang berasal dari backend, sesuai data yang
tersedia:

-   Ringkasan peserta.
-   Ringkasan armada.
-   Status perjalanan.
-   Status/kesegaran lokasi kepala rombongan.
-   Jadwal terdekat.
-   Pengumuman terbaru.
-   Akses cepat ke fungsi utama.

Gunakan hierarki visual yang jelas. Jangan membuat angka atau status
contoh ketika backend belum mempunyai data. Jika data belum tersedia,
tampilkan state kosong yang sesuai.

### C. Kelola peserta

-   Daftar peserta.
-   Pencarian dan filter yang relevan.
-   Tambah peserta.
-   Detail peserta.
-   Edit peserta.
-   Hapus peserta dengan konfirmasi.
-   Pengelolaan kode peserta sesuai kontrak backend.
-   Informasi penugasan armada jika tersedia.
-   Loading, empty, error, dan refresh state.

Seluruh operasi harus tersimpan di backend. Jangan hanya mengubah state
lokal.

### D. Kelola armada

-   Daftar armada.
-   Detail armada.
-   Tambah armada.
-   Edit armada.
-   Hapus armada dengan konfirmasi.
-   Informasi kepala rombongan.
-   Jumlah peserta jika tersedia.
-   Status perjalanan dan lokasi terakhir jika tersedia.

Validasi penugasan mengikuti aturan backend. Jangan membuat asumsi bahwa
satu orang boleh atau tidak boleh memegang beberapa penugasan tanpa
memeriksa kontrak.

### E. Penugasan kepala rombongan dan kode akses

-   Pilih kepala rombongan dari peserta terdaftar sesuai aturan backend.
-   Tampilkan identitas orang yang dipilih sebelum menyimpan.
-   Tampilkan hasil penugasan berdasarkan respons backend.
-   Kelola atau ubah kode akses jika didukung backend.
-   Validasi input dan konfirmasi perubahan penting.
-   Jangan menampilkan atau mencatat rahasia secara tidak semestinya.

### F. Jadwal acara

-   Daftar dan detail jadwal.
-   Tambah, edit, dan hapus jadwal jika didukung.
-   Pemilih tanggal dan waktu yang sesuai Android.
-   Validasi waktu dan data wajib.
-   Tampilkan agenda secara mudah dipindai, misalnya timeline atau
    daftar acara.
-   Tangani zona waktu secara konsisten.

### G. Pengumuman

-   Daftar pengumuman.
-   Detail pengumuman.
-   Buat dan edit pengumuman.
-   Publikasi atau status aktif jika didukung backend.
-   Hapus jika didukung.
-   Konfirmasi tindakan penting.

Jangan menyebut pengumuman telah dipublikasikan sebelum backend
mengonfirmasi hasilnya.

### H. Destinasi bersama

-   Tampilkan destinasi yang tersimpan di backend.
-   Tampilkan nama, alamat, dan koordinat jika tersedia.
-   Ubah destinasi sesuai izin dan kontrak backend.
-   Tampilkan destinasi di peta.
-   Pastikan aplikasi Kepala Rombongan dan PWA Peserta membaca destinasi
    bersama yang sama.

Jangan menanam koordinat permanen di kode sebagai pengganti data
backend.

### I. Peta global

Peta adalah alat pemantauan armada, bukan sekadar gambar.

Tampilkan sesuai data aktual:

-   Posisi kepala rombongan/armada.
-   Nama atau nomor armada.
-   Destinasi bersama.
-   Timestamp pembaruan lokasi.
-   Status kesegaran lokasi.
-   Status perjalanan.
-   Detail saat marker dipilih.

Bedakan lokasi terbaru, tertunda, stale, belum tersedia, dan sesi yang
telah berakhir. Jangan menganggap sesi aktif berarti GPS sedang
mengirim.

### J. Refresh peta dan permintaan lokasi

-   **Refresh peta** berarti mengambil ulang data lokasi yang sudah ada
    di backend.
-   **Minta lokasi terbaru** adalah tindakan terpisah dan hanya boleh
    tersedia jika backend benar-benar mendukung mekanisme permintaan
    tersebut.

Refresh peta tidak otomatis membuat perangkat kepala rombongan mengirim
koordinat baru. Supabase Realtime juga tidak dengan sendirinya menjamin
aplikasi yang dihentikan akan terbangun.

Jika permintaan lokasi didukung, tampilkan status permintaan dan
hasilnya secara jujur.

### K. Detail armada

Tampilkan informasi armada, kepala rombongan, peserta, status
perjalanan, lokasi terakhir, waktu update, destinasi, dan jadwal yang
relevan jika tersedia.

## 4.3 Rekomendasi navigasi Admin

Gunakan navigasi bawah untuk beberapa fungsi paling sering digunakan.
Jumlah tab dan susunannya ditentukan berdasarkan kebutuhan nyata, bukan
dipaksakan mengikuti contoh.

Navigasi harus: - Mudah dijangkau. - Tidak menutupi konten. - Tidak
membuat label terpotong. - Memiliki indikator tab aktif yang jelas. -
Mengikuti safe area. - Tidak menimbulkan flicker atau navigasi ganda.

Fitur sekunder dapat dikelompokkan dalam halaman menu yang
terorganisasi.

------------------------------------------------------------------------

# 5. Aplikasi 2 --- Kepala Rombongan Android Native

## 5.1 Teknologi dan peran

-   **Expo + React Native + TypeScript**.
-   Aplikasi Android native.
-   Supabase bersama dengan Admin.
-   Integrasi GPS aktual dengan background location sesuai dukungan
    Android.
-   EAS Build untuk menghasilkan binary yang mencakup native module yang
    diperlukan.

Aplikasi ini digunakan di lapangan. Pengalaman harus lebih sederhana
daripada Admin, berorientasi tindakan, dan mudah dibaca sambil
menjalankan kegiatan.

## 5.2 Fitur Kepala Rombongan wajib

### A. Login

-   Menggunakan mekanisme autentikasi sesuai dokumentasi backend.
-   Jika menggunakan kode akses, gunakan input yang tepat dan jangan
    menampilkan rahasia.
-   Berikan validasi, loading, dan pesan error.
-   Jangan membuat login simulasi.

### B. Dashboard operasional

Fokus utama dashboard:

1.  Armada yang menjadi tanggung jawab pengguna.
2.  Status perjalanan.
3.  Status GPS dan pengiriman lokasi.
4.  Ringkasan peserta.
5.  Destinasi.
6.  Jadwal terdekat.
7.  Pengumuman penting.

Hero card dapat menampilkan identitas armada dan status perjalanan.
Tombol tindakan utama harus jelas dan mudah dijangkau. Jangan memenuhi
dashboard dengan tabel atau seluruh data peserta.

### C. Mulai dan akhiri perjalanan

-   Mulai perjalanan sesuai kontrak backend.
-   Akhiri perjalanan sesuai kontrak backend.
-   Validasi prasyarat yang memang diwajibkan.
-   Tampilkan status proses.
-   Cegah pengiriman aksi ganda.
-   Minta konfirmasi untuk tindakan penting.
-   Sinkronkan status berdasarkan respons backend.
-   Hentikan tracking setelah sesi perjalanan berakhir.
-   Tangani kegagalan jaringan tanpa berpura-pura operasi berhasil.

Status perjalanan dan status GPS adalah dua hal yang berbeda. Sesi dapat
aktif meskipun lokasi sudah lama tidak terkirim.

### D. Daftar peserta armada

-   Tampilkan peserta yang benar-benar ditugaskan ke armada pengguna.
-   Gunakan otorisasi backend.
-   Jangan mengambil seluruh peserta lalu mengandalkan filter frontend
    sebagai pengamanan.
-   Sediakan pencarian jika diperlukan.
-   Tampilkan data yang relevan saja.

### E. Peta dan destinasi

-   Tampilkan destinasi resmi dari backend.
-   Tampilkan peta dan lokasi armada jika tersedia.
-   Sediakan tautan membuka aplikasi navigasi eksternal jika sesuai.
-   Jangan mengarang alamat atau koordinat.

### F. Jadwal dan pengumuman

-   Tampilkan jadwal acara yang relevan.
-   Sorot agenda berikutnya.
-   Tampilkan waktu dan lokasi acara jika tersedia.
-   Tampilkan pengumuman yang sudah dipublikasikan.
-   Gunakan bahasa yang ringkas dan mudah dipahami.

### G. Status GPS

Pisahkan status berikut:

-   Izin lokasi.
-   GPS perangkat.
-   Status tracking.
-   Status perjalanan.
-   Status jaringan.
-   Waktu lokasi terakhir diperoleh.
-   Waktu lokasi terakhir berhasil dikirim.

Gunakan label yang sesuai keadaan sebenarnya, misalnya: - GPS belum
diizinkan. - GPS perangkat tidak aktif. - Mengambil lokasi. - Mengirim
lokasi. - Lokasi berhasil diperbarui. - Koneksi terputus. - Lokasi
terakhir beberapa menit lalu. - Perjalanan telah berakhir.

Jangan menampilkan "ONLINE" hanya karena sesi perjalanan aktif.

------------------------------------------------------------------------

# 6. Background GPS --- persyaratan kritis

Backend tidak dapat mengambil GPS langsung dari perangkat. Aplikasi
Kepala Rombongan harus mendapatkan koordinat dari perangkat lalu
mengirimkannya ke backend.

Implementasi wajib memeriksa kompatibilitas versi Expo dan library yang
digunakan. Evaluasi `expo-location`, `expo-task-manager`, background
location, foreground service Android, permission, dan konfigurasi native
yang diperlukan.

Jangan hanya menggunakan `setInterval` atau JavaScript foreground untuk
mengklaim background tracking.

### Perilaku yang wajib dirancang

-   Meminta izin lokasi dengan penjelasan yang masuk akal.
-   Mengambil koordinat GPS aktual.
-   Mengirim koordinat ke backend sesuai kontrak.
-   Menyimpan/mengirim timestamp lokasi perangkat jika didukung.
-   Menggunakan waktu penerimaan server jika tersedia.
-   Menghindari pengiriman duplikat yang tidak diperlukan.
-   Mencegah titik lama menimpa lokasi lebih baru.
-   Menghentikan tracking ketika sesi berakhir.
-   Menampilkan status jaringan dan pengiriman secara jujur.
-   Menangani GPS mati, izin dicabut, jaringan terputus, dan sesi
    berakhir.

Interval awal untuk dievaluasi: - Bergerak: sekitar 10--15 detik. -
Berhenti: sekitar 30--60 detik.

Ini target awal, bukan jaminan. Sesuaikan berdasarkan kemampuan OS,
akurasi, konsumsi baterai, dan hasil pengujian.

### Batasan Android

Jangan menjanjikan tracking tanpa henti dalam semua keadaan. Tracking
dapat terhenti ketika aplikasi dihentikan paksa, perangkat mati, izin
dicabut, GPS dimatikan, atau OS membatasi proses.

Gunakan foreground service dan notifikasi persisten jika dibutuhkan dan
sesuai aturan Android. Jangan mengandalkan Expo Go untuk membuktikan
fitur native yang memerlukan development/production build.

### Saat offline

Jika jaringan terputus: - Jangan menyatakan lokasi berhasil dikirim. -
Tampilkan waktu lokasi terakhir yang benar. - Jika antrean lokal
diterapkan, batasi dan kelola data dengan hati-hati. - Saat jaringan
pulih, kirim data yang masih relevan sesuai kontrak. - Jangan membiarkan
titik lama menimpa lokasi terbaru.

### Pengujian fisik wajib

Uji pada perangkat Android nyata: - Aplikasi di foreground. - Aplikasi
di background. - Layar terkunci. - GPS dimatikan. - Izin lokasi
dicabut. - Jaringan putus lalu pulih. - Baterai rendah atau pembatasan
baterai. - Aplikasi dihentikan paksa. - Logout. - Perjalanan berakhir.

Jika belum diuji, tandai sebagai belum diverifikasi.

------------------------------------------------------------------------

# 7. Aplikasi 3 --- Peserta PWA

PWA Peserta dibuat setelah kedua aplikasi native siap. PWA menggunakan
backend Supabase yang sama dan berfokus pada informasi kegiatan, bukan
administrasi atau pengiriman GPS.

## 7.1 Teknologi dan karakter

-   React web.
-   Progressive Web App.
-   Mobile-first.
-   Bisa dipasang pada perangkat yang mendukung instalasi PWA.
-   UI ringan, responsif, dan nyaman di browser mobile.
-   Menggunakan backend dan kontrak yang sama dengan kedua aplikasi
    native.

PWA bukan aplikasi Android native dan tidak boleh diperlakukan seolah
memiliki kemampuan background GPS native.

## 7.2 Fitur PWA Peserta

### A. Identitas peserta

-   Peserta dapat memilih atau mengidentifikasi dirinya sesuai alur yang
    ditentukan backend.
-   Tampilkan informasi peserta dan armada yang relevan.
-   Jika Admin telah menetapkan armada resmi, jangan diam-diam mengganti
    penugasan tersebut dengan pilihan mandiri.
-   Jika self-selection memang diizinkan, bedakan dengan jelas antara
    penugasan resmi dan pilihan peserta.

### B. Beranda kegiatan

Tampilkan: - Identitas FAMILY GATHERING KLKM JAKARTA UTARA. - Informasi
umum kegiatan. - Pengumuman utama. - Destinasi. - Jadwal berikutnya. -
Countdown acara berikutnya jika tanggal dan waktu tersedia. - Informasi
armada yang relevan bagi peserta.

### C. Peta global

-   Tampilkan peta interaktif.
-   Tampilkan destinasi bersama.
-   Tampilkan posisi kepala rombongan/armada dari backend.
-   Tampilkan waktu pembaruan lokasi.
-   Bedakan posisi terkini dan posisi lama.
-   Tampilkan keadaan ketika lokasi belum tersedia.

PWA adalah konsumen data GPS, bukan sumber lokasi armada.

### D. Pengumuman

Tampilkan pengumuman yang dipublikasikan. Pengumuman utama dapat
menggunakan marquee atau ticker, tetapi harus tetap mudah dibaca, tidak
terlalu cepat, tidak mengganggu aksesibilitas, dan tidak menjadi
satu-satunya cara menyampaikan informasi.

### E. Jadwal

-   Agenda kegiatan.
-   Waktu dan lokasi jika tersedia.
-   Penekanan pada acara berikutnya.
-   Countdown jika data waktu valid.
-   Tampilan yang tetap benar ketika tidak ada jadwal.

### F. Informasi umum

Sediakan bagian informasi penting kegiatan sesuai data yang benar-benar
disediakan backend. Jangan membuat detail acara, nomor kontak, atau
informasi lokasi yang tidak diberikan.

## 7.3 Standar PWA

-   Layout mobile-first dan responsif.
-   Navigasi yang mudah.
-   Loading, empty, error, dan offline state.
-   Tidak menggunakan data demo.
-   Tidak mengklaim posisi live jika data sudah lama.
-   Tidak meminta izin lokasi peserta jika tidak dibutuhkan.
-   Tidak menggunakan GPS peserta sebagai pengganti GPS kepala
    rombongan.
-   Konfigurasi manifest dan service worker mengikuti kebutuhan serta
    arsitektur PWA yang dipilih.
-   Cache tidak boleh menyebabkan informasi penting tampak terbaru
    padahal stale.

------------------------------------------------------------------------

# 8. Integrasi Supabase bersama

Dokumentasi backend adalah kontrak integrasi. Sebelum
mengimplementasikan frontend, buat pemetaan fitur ke sumber data yang
benar-benar tersedia.

Buat `docs/FRONTEND_BACKEND_MAPPING.md` dengan kolom minimal:

  -------------------------------------------------------------------------------
  Aplikasi    Fitur/halaman   Tabel/RPC/API   Operasi     Status      Catatan
  ----------- --------------- --------------- ----------- ----------- -----------

  -------------------------------------------------------------------------------

Aturan integrasi:

-   Jangan mengarang tabel, kolom, RPC, endpoint, atau parameter.
-   Gunakan satu konfigurasi Supabase yang sesuai struktur repository.
-   Jangan pernah memasukkan `service_role` key ke frontend.
-   Gunakan autentikasi dan RLS sesuai dokumentasi backend.
-   Frontend bukan satu-satunya lapisan otorisasi.
-   Bersihkan subscription realtime saat tidak digunakan.
-   Hindari polling terlalu sering.
-   Jangan menampilkan pesan sukses sebelum backend mengonfirmasi.
-   Tangani error jaringan dan backend dengan bahasa yang mudah
    dimengerti.
-   Jangan mengubah kontrak backend secara sepihak.
-   Jika fitur membutuhkan perubahan backend, dokumentasikan kebutuhan
    dan alasan.

Realtime dapat digunakan jika memang tersedia dan relevan. Realtime
bukan jaminan untuk membangunkan aplikasi Android yang dihentikan.

------------------------------------------------------------------------

# 9. Rekomendasi struktur repository

Sesuaikan dengan repository aktual; jangan memaksakan struktur baru jika
proyek sudah mempunyai struktur yang sehat.

Contoh struktur monorepo yang sederhana:

``` text
family-gathering/
├── apps/
│   ├── admin-android/
│   │   ├── app/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   ├── state/
│   │   │   ├── theme/
│   │   │   └── utils/
│   │   ├── assets/
│   │   ├── app.config.ts
│   │   ├── eas.json
│   │   └── package.json
│   ├── kepala-rombongan-android/
│   │   ├── app/
│   │   ├── src/
│   │   ├── assets/
│   │   ├── app.config.ts
│   │   ├── eas.json
│   │   └── package.json
│   └── peserta-pwa/
│       └── (dikerjakan pada tahap berikutnya)
├── packages/
│   └── shared/
│       └── (hanya utilitas/tipe yang benar-benar bisa dipakai bersama)
├── docs/
│   ├── BACKEND_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_REFERENCE.md
│   ├── FRONTEND_DESIGN_SYSTEM.md
│   ├── FRONTEND_SCREEN_BLUEPRINT.md
│   ├── FRONTEND_BACKEND_MAPPING.md
│   ├── ANDROID_BACKGROUND_GPS.md
│   ├── EAS_BUILD.md
│   ├── GITHUB_ACTIONS.md
│   ├── TEST_CHECKLIST.md
│   └── IMPLEMENTATION_STATUS.md
└── README.md
```

Struktur di atas adalah contoh, bukan kewajiban untuk memindahkan
repository yang sudah ada. Jika dua aplikasi dikelola dalam repository
terpisah, dokumentasikan konfigurasi masing-masing dan tetap gunakan
kontrak backend bersama.

------------------------------------------------------------------------

# 10. Expo, EAS Build, dan GitHub Actions

Kedua aplikasi Android harus disiapkan untuk dibangun melalui EAS Build
dengan workflow GitHub Actions.

## 10.1 Konfigurasi

Periksa dan sesuaikan: - `package.json` dan lockfile. - `app.json` atau
`app.config.ts`. - `eas.json`. - TypeScript configuration. - Konfigurasi
Babel/Metro jika diperlukan. - Plugin native. - Android permissions. -
App icon dan splash screen. - Environment variables. - `.gitignore`. -
Workflow GitHub Actions.

Jangan melakukan upgrade Expo atau React Native secara sembarangan.
Periksa kompatibilitas semua dependency terlebih dahulu.

## 10.2 Build profiles

Siapkan profile yang sesuai untuk: - Development build bila dibutuhkan
untuk pengujian native. - Preview APK untuk instalasi dan pengujian. -
Production AAB untuk distribusi.

Nama dan detail profile mengikuti kebutuhan proyek dan konfigurasi EAS
yang valid.

## 10.3 GitHub Actions

Workflow harus: 1. Checkout repository. 2. Menggunakan Node.js yang
sesuai. 3. Menginstal dependency secara reproducible. 4. Menjalankan
TypeScript check. 5. Menjalankan lint/test jika tersedia. 6. Memvalidasi
konfigurasi Expo. 7. Memulai EAS Build sesuai profile dan trigger. 8.
Menampilkan status proses secara jelas.

Dokumentasikan `EXPO_TOKEN` dan semua environment variable yang
benar-benar diperlukan. Nilai rahasia disimpan di GitHub Secrets, bukan
di repository.

Jangan menaruh secret Supabase server di dalam bundle aplikasi. Variabel
yang ditanam ke aplikasi klien harus diperlakukan sebagai informasi yang
dapat dilihat pengguna.

Jangan mengklaim build berhasil jika proses EAS belum selesai dan
hasilnya belum tersedia.

------------------------------------------------------------------------

# 11. Dokumentasi proyek yang wajib dipelihara

Dokumentasi harus sesuai dengan kode aktual.

  -------------------------------------------------------------------------
  Dokumen                               Isi
  ------------------------------------- -----------------------------------
  `README.md`                           Gambaran proyek, aplikasi, fitur,
                                        cara kerja, dan alur pengembangan

  `docs/FRONTEND_DESIGN_SYSTEM.md`      Token visual dan aturan komponen

  `docs/FRONTEND_SCREEN_BLUEPRINT.md`   Spesifikasi layar dan alur navigasi

  `docs/FRONTEND_BACKEND_MAPPING.md`    Pemetaan fitur ke tabel/RPC/API

  `docs/ANDROID_BACKGROUND_GPS.md`      Permission, task, lifecycle,
                                        pengiriman, dan batasan GPS

  `docs/EAS_BUILD.md`                   Profile, environment, dan langkah
                                        build

  `docs/GITHUB_ACTIONS.md`              Workflow, secrets, trigger, dan
                                        troubleshooting

  `docs/TEST_CHECKLIST.md`              Daftar tes yang harus dijalankan

  `docs/IMPLEMENTATION_STATUS.md`       Fitur selesai, belum selesai,
                                        diuji, dan belum diverifikasi
  -------------------------------------------------------------------------

Jika dokumentasi backend telah disediakan dengan nama lain, jangan
membuat salinan yang bertentangan. Pertahankan dokumen sumber dan rujuk
dari dokumentasi frontend.

------------------------------------------------------------------------

# 12. Strategi implementasi

Kerjakan dalam urutan berikut:

1.  **Audit** --- baca dokumentasi backend dan periksa repository serta
    dependency.
2.  **Pemetaan fitur** --- cocokkan seluruh kebutuhan dengan kontrak
    backend.
3.  **Design system** --- tetapkan warna, tipografi, komponen, dan
    aturan visual.
4.  **Screen blueprint** --- definisikan semua layar, state, tindakan,
    dan navigasi.
5.  **Fondasi aplikasi** --- konfigurasi Expo, TypeScript, navigasi,
    Supabase, autentikasi, dan error handling.
6.  **Admin** --- implementasikan seluruh halaman dan CRUD.
7.  **Kepala Rombongan** --- implementasikan dashboard operasional,
    perjalanan, data armada, dan informasi kegiatan.
8.  **Background GPS** --- implementasikan native tracking, pengiriman,
    lifecycle, dan penanganan offline.
9.  **EAS/GitHub Actions** --- siapkan konfigurasi build dan
    dokumentasinya.
10. **QA** --- audit layar, navigasi, integrasi backend, GPS, dan build.
11. **PWA Peserta** --- dikerjakan setelah kedua aplikasi native siap,
    menggunakan kontrak backend yang sama.
12. **Final report** --- laporkan status nyata, masalah tersisa,
    konfigurasi, dan pengujian yang belum dilakukan.

Jangan berhenti setelah membuat rencana atau prototype jika implementasi
masih dapat dilanjutkan.

------------------------------------------------------------------------

# 13. Checklist pengujian

## Admin

-   [ ] Login dan logout.
-   [ ] Pemulihan sesi.
-   [ ] Dashboard membaca data backend.
-   [ ] CRUD peserta.
-   [ ] Pengelolaan kode peserta sesuai backend.
-   [ ] CRUD armada.
-   [ ] Penugasan kepala rombongan.
-   [ ] Pengelolaan kode akses jika didukung.
-   [ ] CRUD jadwal.
-   [ ] CRUD/publikasi pengumuman sesuai backend.
-   [ ] Pengelolaan destinasi.
-   [ ] Peta global.
-   [ ] Detail armada.
-   [ ] Refresh data peta.
-   [ ] Status lokasi berdasarkan timestamp.
-   [ ] Loading, empty, error, dan offline state.
-   [ ] Android Back dan navigasi.
-   [ ] Layout pada layar kecil dan keyboard terbuka.

## Kepala Rombongan

-   [ ] Login dan logout.
-   [ ] Data armada yang benar.
-   [ ] Daftar peserta sesuai penugasan.
-   [ ] Mulai perjalanan.
-   [ ] Akhiri perjalanan.
-   [ ] Destinasi dan peta.
-   [ ] Jadwal dan pengumuman.
-   [ ] Permission lokasi.
-   [ ] GPS foreground.
-   [ ] GPS background.
-   [ ] Layar terkunci.
-   [ ] Pengiriman lokasi ke backend.
-   [ ] Jaringan terputus dan pulih.
-   [ ] GPS dimatikan.
-   [ ] Izin dicabut.
-   [ ] Aplikasi dihentikan paksa.
-   [ ] Tracking berhenti setelah perjalanan berakhir.
-   [ ] Status lokasi tidak menyesatkan.

## PWA Peserta

-   [ ] Identifikasi peserta sesuai alur backend.
-   [ ] Penugasan armada ditampilkan dengan benar.
-   [ ] Beranda informasi kegiatan.
-   [ ] Peta global dan destinasi.
-   [ ] Timestamp dan freshness lokasi.
-   [ ] Pengumuman.
-   [ ] Jadwal dan countdown.
-   [ ] Empty/error/offline state.
-   [ ] Responsif pada layar mobile.
-   [ ] Instalasi PWA dan perilaku cache diuji.

## Build dan kualitas

-   [ ] Dependency sesuai versi Expo.
-   [ ] TypeScript check.
-   [ ] Lint/test sesuai konfigurasi.
-   [ ] Validasi Expo.
-   [ ] Konfigurasi EAS.
-   [ ] GitHub Actions.
-   [ ] Preview APK benar-benar dapat diunduh dan dipasang jika build
    dijalankan.
-   [ ] AAB produksi dibangun jika diminta dan konfigurasi tersedia.
-   [ ] Tidak ada secret yang masuk repository atau bundle.
-   [ ] Hasil tes fisik dicatat secara jujur.

Checklist ini adalah daftar pengujian, bukan bukti bahwa semua pengujian
telah lulus.

------------------------------------------------------------------------

# 14. Kriteria selesai

Sebuah aplikasi tidak dianggap selesai hanya karena tampilannya menarik.

### Desain

-   Identitas visual khas dan konsisten.
-   Tidak terlihat seperti template generik.
-   Efek glossy terkendali dan tidak mengganggu keterbacaan.
-   Semua layar memiliki hierarki dan state yang jelas.
-   Tidak ada layout terpotong atau tombol yang sulit digunakan.

### Fungsionalitas

-   Fitur yang termasuk ruang lingkup telah diimplementasikan.
-   Operasi data terhubung ke backend.
-   Tidak ada mock data sebagai pengganti data produksi.
-   Tidak ada fake success atau GPS simulasi.
-   Navigasi dan Android Back berfungsi.
-   Error ditangani dengan benar.

### GPS

-   Menggunakan koordinat perangkat sebenarnya.
-   Mengirim data sesuai kontrak backend.
-   Lifecycle tracking mengikuti status perjalanan.
-   Batasan Android didokumentasikan.
-   Pengujian background dilakukan pada perangkat fisik atau secara
    eksplisit ditandai belum dilakukan.

### Build

-   Konfigurasi Expo dan EAS valid.
-   GitHub Actions tersedia dan terdokumentasi.
-   Dependency kompatibel.
-   Hasil build dan tes dilaporkan sesuai bukti aktual.

### Dokumentasi

-   Petunjuk menjalankan aplikasi tersedia.
-   Konfigurasi environment jelas.
-   Pemetaan backend diperbarui.
-   Kekurangan yang belum selesai dicatat.

------------------------------------------------------------------------

# 15. Laporan status akhir

Setelah setiap tahap besar, perbarui `docs/IMPLEMENTATION_STATUS.md`.

Laporan akhir minimal memuat:

1.  Fitur yang telah diimplementasikan.
2.  Fitur yang telah diuji.
3.  Fitur yang belum diuji.
4.  Status integrasi Supabase.
5.  Status background GPS.
6.  Status konfigurasi EAS dan GitHub Actions.
7.  Konfigurasi eksternal yang diperlukan.
8.  Masalah yang masih ada.
9.  Langkah untuk menjalankan dan membangun aplikasi.

Bedakan secara tegas antara: - **Diimplementasikan** --- kode sudah
dibuat. - **Diuji** --- pengujian terkait benar-benar dijalankan. -
**Build berhasil** --- proses build benar-benar selesai. - **Belum
diverifikasi** --- bukti belum tersedia. - **Memerlukan konfigurasi
eksternal** --- misalnya API key peta atau Expo token.

------------------------------------------------------------------------

## Instruksi akhir untuk AI coding agent

Gunakan README ini sebagai pedoman kerja utama untuk FAMILY GATHERING
--- KLKM JAKARTA UTARA.

Mulai dari audit repository dan dokumentasi backend. Tetapkan design
system dan screen blueprint sebelum mengimplementasikan seluruh layar.
Setelah itu, bangun Admin Android dan Kepala Rombongan Android hingga
fitur yang termasuk ruang lingkup terintegrasi dan tervalidasi. Siapkan
EAS Build serta GitHub Actions, dan dokumentasikan hasil pengujian
secara jujur.

PWA Peserta merupakan tahap berikutnya. Ketika dibangun, PWA harus
menggunakan Supabase dan sumber destinasi/lokasi yang sama, tetapi tetap
memiliki UX web mobile-first yang sesuai platform.

Jangan mengarang kontrak backend, data, hasil tes, atau kemampuan GPS.
Jangan berhenti pada mockup. Utamakan desain premium, fungsi nyata,
pengalaman native yang mudah digunakan, integrasi yang benar, dan hasil
build yang dapat diverifikasi.
