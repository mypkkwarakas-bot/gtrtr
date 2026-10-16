

> **Satu aplikasi, dua peran.** `app/login.tsx` punya dua tab: *Kepala Rombongan* (hanya PIN yang didaftarkan Admin → Edge Function `leader-login`) dan *Admin* (email + kata sandi). Peran diambil dari `app_metadata.role` di sesi (bukan pilihan klien); `app/_layout.tsx` memakai `Stack.Protected` sehingga Admin hanya bisa membuka `/admin/*` dan Kepala hanya `/kepala/*`.
