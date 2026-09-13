# owi — Indonesian Political Claim-Checking Tool

Frontend untuk sistem pemeriksa klaim politik Indonesia berbasis bukti terbuka (*open-source evidence retrieval & classification*).

## Ringkasan Proyek

**owi** adalah instrumen berbantuan komputasi yang dirancang dengan pendekatan editorial sober untuk memeriksa konsistensi narasi atau klaim politik terhadap arsip periksa fakta, rilis resmi kementerian, putusan lembaga peradilan, dan liputan jurnalistik terverifikasi.

## Karakteristik & Fitur Utama

1. **Input View**:
   - Kolom textarea besar dengan petunjuk berbahasa Indonesia.
   - Penghitung karakter (*character counter*) dengan batas 1000 karakter.
   - Tombol "Periksa Klaim" dengan status pemuatan (*loading state*).
   - 3 tombol klaim contoh aktual untuk pengujian instan.

2. **Result View (Sesuai Urutan Kontrak)**:
   - **Verdict Badge & Confidence**: Indikator putusan disertai bar persentase keyakinan model (*confidence bar*).
   - **Extracted Claim**: Inti klaim yang dinormalisasi, ditampilkan dalam kutipan editorial berbobot.
   - **Evidence List**: Bagian paling penting dengan bobot visual utama. Menampilkan nama media/lembaga rujukan, tanggal terbit, label sikap (*stance chip*: `SUPPORTS` [Hijau], `REFUTES` [Merah], `UNRELATED` [Abu-abu]), kutipan kutipan penting (*snippet*), dan tautan dokumen asli.
   - **Entitas Disebut (`Entitas disebut`)**: Pemetaan entitas (Lembaga, Tokoh, Partai) beserta sentimen, disertai catatan metodologi bahwa sentimen kritis bukan indikator hoaks.
   - **Penjelasan Kontribusi Kata (LIME Token Attribution)**: Visualisasi kata-kata pada kalimat klaim dengan latar hangat (oranye/merah) untuk bobot positif dan dingin (biru) untuk bobot negatif, dengan kepekatan (*opacity*) proporsional terhadap besar nilai bobot $|weight|$. Komponen ini bersifat *collapsible* (tertutup secara bawaan).

3. **Perilaku Khusus Kasus Bukti Kosong (`retrieval_empty: true`)**:
   - Jika `retrieval_empty: true`, antarmuka secara tegas **tidak menampilkan vonis percaya diri**.
   - Menampilkan status netral *"Tidak dapat diverifikasi"* serta mendeeskalasi skor keyakinan agar tidak pernah tampak seperti memberikan putusan mutlak.

4. **Riwayat Sesi In-Memory**:
   - Riwayat klaim yang diperiksa selama sesi aktif (hanya tersimpan dalam memori, tanpa `localStorage`).
   - Dapat diklik untuk meninjau kembali hasil evaluasi terdahulu.

5. **Disclaimer Permanen**:
   - Catatan integritas di bagian kaki halaman (*footer*) yang menegaskan bahwa owi adalah alat bantu asistif, bukan putusan final kebenaran atau hukum.

---

## Kontrak API (`POST /api/analyze`)

Aplikasi dibangun persis mengikuti spesifikasi kontrak:

```typescript
// Request
POST /api/analyze
Content-Type: application/json

{
  "text": "Pemerintah secara resmi menghapus total BBM bersubsidi..."
}

// Response
{
  "verdict": "TRUE" | "MISLEADING" | "FALSE" | "UNVERIFIABLE" | "OPINION",
  "confidence": 0.86,
  "claim_extracted": "Pemerintah menghapus total BBM bersubsidi jenis Pertalite...",
  "entities": [
    { "name": "Kementerian ESDM", "type": "INSTITUTION", "stance": "NEUTRAL" }
  ],
  "topic": "Kebijakan Publik & Energi",
  "explanation_tokens": [
    { "token": "menghapus", "weight": -0.74 }
  ],
  "evidence": [
    {
      "title": "BPH Migas: Tidak Ada Penghapusan Pertalite Total...",
      "source": "Katadata",
      "url": "https://katadata.co.id",
      "published": "3 September 2024",
      "stance": "REFUTES",
      "snippet": "BPH Migas memastikan pemerintah tidak menghapus BBM Pertalite..."
    }
  ],
  "retrieval_empty": false
}
```

### Mengalihkan ke Backend Riil

Seluruh pemanggilan API diisolasi pada modul `src/lib/api.ts`.
Untuk menghubungkan ke backend produksi:

1. Buka file `src/lib/api.ts`.
2. Ubah konstanta `MOCK` dari `true` menjadi `false`:
   ```typescript
   export const MOCK = false;
   ```
3. Aplikasi akan langsung mengirim permintaan riil `fetch('/api/analyze', { method: 'POST', ... })`.

---

## Panduan Menjalankan (Run Instructions)

### Prasyarat
- Node.js (versi 18 ke atas)
- npm

### Menjalankan secara Lokal

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server pengembangan
npm run dev
```

Aplikasi dapat diakses pada peramban web di:
```
http://localhost:3000
```

### Membangun untuk Produksi

```bash
npm run build
```

---

## Struktur Berkas

```
├── index.html                   # Entry point HTML dengan font Newsreader & Plus Jakarta Sans
├── metadata.json                # Metadata aplikasi
├── package.json                 # Konfigurasi dependensi dan skrip
├── README.md                    # Dokumentasi dan petunjuk menjalankan
└── src/
    ├── App.tsx                  # Komponen induk dan pengelola alur kerja utama
    ├── index.css                # Konfigurasi Tailwind CSS dan utilitas tipografi
    ├── main.tsx                 # Titik masuk React 18+
    ├── types.ts                 # Definisi tipe TypeScript sesuai kontrak API
    ├── lib/
    │   └── api.ts               # Modul API, flag MOCK, dan 5 dataset kasus uji coba
    └── components/
        ├── ClaimInput.tsx       # Form input klaim, counter karakter, dan 3 tombol contoh
        ├── VerdictCard.tsx      # Kartu vonis, progress bar keyakinan, dan kutipan klaim inti
        ├── EvidenceList.tsx     # Daftar bukti (sumber, tanggal, stance chip, kutipan, tautan)
        ├── EntityChips.tsx      # Chips entitas dengan catatan metodologi
        ├── TokenExplanation.tsx # Visualisasi LIME token attribution (hangat/dingin)
        ├── HistorySidebar.tsx   # Sidebar riwayat in-memory sesi berjalan
        └── ResultSkeleton.tsx   # Skeleton loader saat proses analisis berlangsung
```
