# 🕐 Cron Job Setup untuk Payment Reminders

## Overview
Sistem ini memiliki 2 jenis email otomatis:

1. **Order Confirmation Email** - Dikirim saat checkout berhasil ✅
2. **Payment Reminder Email** - Dikirim setelah 6 jam jika belum dibayar ⏰

## 1. Order Confirmation Email (Otomatis)
- **Trigger**: Setelah checkout berhasil
- **Status**: Sudah aktif, tidak perlu setup tambahan
- **Email**: Konfirmasi order dengan detail produk dan instruksi pembayaran

## 2. Payment Reminder Email (6 Jam)
- **Trigger**: Cron job yang dijalankan setiap 6 jam
- **Endpoint**: `/api/cron/payment-reminders`
- **Fungsi**: Kirim pengingat untuk order yang masih pending

## Setup Cron Job

### Option 1: Vercel Cron Jobs (Recommended)
Jika menggunakan Vercel, tambahkan di `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/payment-reminders",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Option 2: External Cron Service
Gunakan layanan seperti:
- **Cron-job.org** (Free)
- **EasyCron** (Free tier available)
- **UptimeRobot** (Free)

**Setup di cron-job.org:**
1. Buat account di [cron-job.org](https://cron-job.org)
2. Buat new cron job
3. **URL**: `https://yourdomain.com/api/cron/payment-reminders`
4. **Schedule**: `0 */6 * * *` (setiap 6 jam)
5. **Method**: POST
6. **Headers**: 
   - `Authorization: Bearer YOUR_CRON_SECRET`
   - `Content-Type: application/json`

### Option 3: Manual Testing
Test endpoint secara manual:

```bash
# Test GET (info)
curl https://yourdomain.com/api/cron/payment-reminders

# Test POST (run job)
curl -X POST https://yourdomain.com/api/cron/payment-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

## Environment Variables

Tambahkan di `.env.local`:

```bash
# Cron job security
CRON_SECRET=your-secret-key-here

# Site URL untuk email links
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Monitoring

### Logs
Cek logs untuk memantau cron job:

```bash
# Vercel logs
vercel logs --follow

# Local development
npm run dev
```

### Database
Cek tabel `notifications` untuk melihat email yang dikirim:

```sql
SELECT 
  type,
  status,
  created_at,
  error_message
FROM notifications 
WHERE type IN ('order_confirmation', 'payment_reminder')
ORDER BY created_at DESC;
```

## Troubleshooting

### Email tidak terkirim
1. Cek email settings di admin panel
2. Cek logs untuk error
3. Test email service manual

### Cron job tidak jalan
1. Cek schedule cron job
2. Cek authorization header
3. Test endpoint manual

### Duplicate emails
1. Cek logic di `payment-reminders` route
2. Pastikan tidak ada cron job yang overlap

## Schedule Options

### Setiap 6 jam (Recommended)
```bash
0 */6 * * *  # Jam 00:00, 06:00, 12:00, 18:00
```

### Setiap 4 jam
```bash
0 */4 * * *  # Jam 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
```

### Setiap hari jam 10:00
```bash
0 10 * * *   # Jam 10:00 setiap hari
```

## Security

- **CRON_SECRET**: Wajib di-set untuk production
- **Rate Limiting**: Sudah ada delay 1 detik antar email
- **Authorization**: Cek header sebelum proses

## Testing

1. **Buat order** dan tunggu 6 jam
2. **Jalankan cron job** manual
3. **Cek email** customer
4. **Cek database** notifications

## Support

Jika ada masalah:
1. Cek logs terlebih dahulu
2. Test endpoint manual
3. Cek email configuration
4. Hubungi support team
