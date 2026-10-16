# Rilis MVP — langkah singkat (tanpa terminal)

Sudah tertanam di kode: kunci publishable Supabase (`src/config.ts`), slug/owner/Project ID Expo (`app.config.ts`: `wings545` / `wings445`), backend login PIN saja.

1. GitHub → Settings → Secrets and variables → Actions → Secret `EXPO_TOKEN` (token dari expo.dev → Access tokens). Variable tidak perlu.
2. Buat keystore Android di expo.dev → project `wings545` → Credentials (sekali).
3. Actions → **EAS Build Android** → Run workflow → `preview` (APK) → unduh dari expo.dev → Builds.
4. Buat akun Admin di Supabase Auth dengan `app_metadata.role = 'admin'`; isi armada/peserta/kepala lewat app Admin; atur PIN kepala.
5. Uji lapangan: `docs/TEST_CHECKLIST.md` (GPS layar terkunci, izin dicabut, offline).
6. Play Store: profile `production` (AAB) + deklarasi lokasi latar belakang.

Status jujur: belum pernah dikompilasi/dijalankan. Bila build merah, perbaiki dari log.
