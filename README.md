# Shanti Catering

Website catering Surabaya dengan katalog lokal, pencatatan pesanan, notifikasi email opsional, dan alur konfirmasi WhatsApp.

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Tanpa kredensial Supabase, aplikasi tetap bisa dipakai untuk UI QA. `POST /api/order` memvalidasi data dan menulis log lokal, lalu mengembalikan `persistence: "local"`; tidak ada order yang tersimpan. Saat `NODE_ENV=production`, endpoint menolak order bila Supabase belum lengkap agar tidak pernah mengklaim pesanan tersimpan padahal tidak.

## Menyiapkan Supabase

1. Buat project Supabase dan salin URL, publishable key, serta secret key ke `.env.local`. Secret key hanya untuk server—jangan masukkan ke variabel `NEXT_PUBLIC_*`.
2. Jalankan [Supabase CLI](https://supabase.com/docs/guides/cli), link project, lalu terapkan schema:

   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

3. Buat akun pemilik untuk CMS admin. Isi `ADMIN_EMAIL` dan `ADMIN_PASSWORD` (minimal 12 karakter) di `.env.local`, lalu jalankan:

   ```bash
   npm run setup:admin
   ```

   Apabila menjalankan dari terminal biasa, ekspor nilai environment tersebut terlebih dahulu. Login CMS tersedia di `/admin`; di sana pemilik dapat melihat pesanan dan mengubah statusnya.

Migration membuat tabel `orders`, `profiles`, dan snapshot ulasan Google untuk akses server. Menu, paket, dan gambar berasal dari [`constants/menu.ts`](constants/menu.ts) dan [`public/images`](public/images), lalu ikut ter-host bersama website saat deploy.

## Snapshot ulasan Google Business Profile

Ulasan Google ditampilkan dari snapshot yang tersimpan di Supabase. Pengunjung tidak pernah memanggil Google API. Setelah migration pernah dibuat atau sinkronisasi pernah berjalan, snapshot yang kedaluwarsa/tidak tersedia ditampilkan sebagai status belum tersedia dengan tautan profil Google—nama dan komentar fallback tidak digunakan. Fallback hard-coded hanya dipakai saat development lokal benar-benar belum memiliki konfigurasi/setup.

1. Di Google Cloud aktifkan Account Management API, Business Information API, dan Business Profile Reviews API. Buat OAuth client, minta scope `https://www.googleapis.com/auth/business.manage`, lalu simpan refresh token owner.
2. Isi seluruh `GOOGLE_BUSINESS_*` dan `CRON_SECRET` di `.env.local` atau secret deployment. Profile URL harus HTTPS dan berasal dari Google Maps/Business. `CRON_SECRET` minimal 32 byte; buat dengan `openssl rand -hex 32`. `GOOGLE_BUSINESS_ACCOUNT_ID` dan `GOOGLE_BUSINESS_LOCATION_ID` adalah resource ID yang sudah ditemukan sebelumnya; endpoint tidak menerima ID lewat query string.
3. Biarkan `GOOGLE_REVIEWS_SNAPSHOT_ENABLED=false` (atau kosong) untuk local/dev dan production sebelum snapshot siap. Dalam mode ini homepage memakai data statis yang sudah ada dan tidak melakukan read snapshot Supabase. Set literal `GOOGLE_REVIEWS_SNAPSHOT_ENABLED=true` hanya setelah migration diterapkan dan sync pertama berhasil; setelah itu homepage hanya memakai snapshot tersimpan yang masih valid atau status unavailable.
4. Terapkan migration Supabase dengan `supabase db push`. Tabel snapshot memakai RLS dan tidak memberi read/write ke `anon` atau `authenticated`; hanya service role server yang boleh mengaksesnya.
5. Jalankan verifikasi lokal/manual setelah environment lengkap:

   ```bash
   npm run sync:google-reviews
   ```

   Vercel Cron sudah dikonfigurasi untuk memanggil endpoint setiap hari pukul **03:17 UTC** (`17 3 * * *`). Saat environment production `CRON_SECRET` diatur, Vercel menyertakan `Authorization: Bearer $CRON_SECRET` pada request. Konfirmasi eksekusi dengan membuka deployment terkait di Vercel Dashboard lalu memeriksa **Logs** untuk request `/api/cron/google-reviews` dan status JSON-nya. Endpoint melakukan purge expiry dan due/lease check setiap invocation; Google API hanya dipanggil saat due, paling banyak sekali setiap 14 hari. Kegagalan mencoba lagi dalam maksimal 24 jam dan tidak memajukan cadence 14 hari.

Semua client secret, refresh token, service-role key, dan `CRON_SECRET` hanya boleh berada di environment server. Jangan commit secrets atau menaruhnya di `NEXT_PUBLIC_*` maupun tabel Supabase publik.

## Notifikasi order

Resend bersifat opsional. Jika menyiapkan domain pengirim terverifikasi dan mengisi `RESEND_API_KEY`, `RESEND_FROM`, serta `ORDER_NOTIFICATION_TO`, sistem akan mengirim email pesanan. Tanpa Resend, order tetap tersimpan dan status email menjadi `skipped`; pelanggan tetap diarahkan ke WhatsApp dengan reference order.

Kontrak `POST /api/order` tetap mendukung form lama:

```json
{
  "name": "Budi Santoso",
  "phone": "08123456789",
  "menuId": "1",
  "porsi": 50,
  "date": "2026-08-20",
  "alamat": "Mulyorejo, Surabaya",
  "notes": "Tanpa sambal"
}
```

Form baru harus memakai `selectionType` (`menu`, `package`, atau `custom`) dan `selectionId` menu lokal. Harga apa pun dari browser diabaikan; server mengambil harga dari kode dan menyimpan snapshotnya ke `orders`.

## Sebelum rilis

- Ganti nilai contoh di `.env.local` dengan credentials produksi dan gunakan domain bisnis pada `SITE_URL`.
- Lakukan satu test order end-to-end; verifikasi pengirim Resend bila notifikasi email ingin digunakan.
- Lengkapi Google Business Profile dan Search Console, lalu submit sitemap setelah domain deploy.
- Jalankan `npm run lint` dan `npm run build`.
