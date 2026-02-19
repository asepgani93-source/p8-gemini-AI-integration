# Tanya AI - Aplikasi Chatbot dengan Ionic Angular & Gemini

Aplikasi lengkap untuk mempelajari **HTTP Client**, **Observable**, dan **Integrasi Gemini AI** dalam pengembangan aplikasi mobile dengan Ionic Angular.

## 📚 Materi yang Dicakup

### 1. REST API & HTTP Client
- Cara aplikasi mobile berkomunikasi dengan server
- Menggunakan `HttpClient` dari Angular
- Konfigurasi provider di `main.ts`

### 2. Asynchronous: Promise vs Observable

| Fitur | Promise | Observable |
|-------|---------|------------|
| Konsep | Sekali jalan (One-time) | Stream data berkelanjutan |
| Library | Native JavaScript | RxJS (Bawaan Angular) |
| Cancel | Tidak bisa | Bisa dengan `unsubscribe()` |
| Cocok untuk | Aksi simpel | Data real-time & kompleks |

### 3. Integrasi Gemini AI
- Menggunakan Google Gemini API
- Mengirim prompt dan menerima respons
- Error handling untuk berbagai skenario

## 🚀 Fitur Aplikasi

### 1. Tanya Pak AI (Chatbot)
- **Lokasi**: `src/app/home/`
- **Teknologi**: Observable (RxJS)
- **Fitur**:
  - Chat interface mirip WhatsApp
  - Real-time response dari Gemini AI
  - Loading indicator
  - Error handling

### 2. Random User Generator
- **Lokasi**: `src/app/pages/random-user/`
- **Teknologi**: Promise (async/await)
- **Fitur**:
  - Generate profil user palsu
  - Menggunakan API randomuser.me
  - Convert Observable ke Promise dengan `lastValueFrom()`

### 3. Live Grammar Checker
- **Lokasi**: `src/app/pages/grammar-checker/`
- **Teknologi**: Observable dengan RxJS Operators
- **Fitur**:
  - Pengecek grammar bahasa Inggris real-time
  - Tanpa tombol "Cek" - otomatis saat mengetik
  - Operator: `debounceTime`, `distinctUntilChanged`, `switchMap`, `catchError`

## 📁 Struktur Project

```
tanya-ai/
├── src/
│   ├── app/
│   │   ├── home/                    # Chatbot AI (Observable)
│   │   │   ├── home.page.ts
│   │   │   ├── home.page.html
│   │   │   └── home.page.scss
│   │   ├── pages/
│   │   │   ├── random-user/         # Random User (Promise)
│   │   │   │   ├── random-user.page.ts
│   │   │   │   ├── random-user.page.html
│   │   │   │   └── random-user.page.scss
│   │   │   └── grammar-checker/     # Grammar Checker (Observable + Operators)
│   │   │       ├── grammar-checker.page.ts
│   │   │       ├── grammar-checker.page.html
│   │   │       └── grammar-checker.page.scss
│   │   ├── services/
│   │   │   └── gemini.service.ts    # Service untuk Gemini AI
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   └── app.routes.ts
│   ├── main.ts                      # Entry point dengan HttpClient
│   ├── index.html
│   └── global.scss
├── package.json
├── angular.json
└── tsconfig.json
```

## 🔧 Konfigurasi API Key Gemini

1. Kunjungi [Google AI Studio](https://aistudio.google.com)
2. Login dengan akun Google
3. Klik "Get API key" → "Create API key"
4. Copy API key
5. Paste di file `src/app/services/gemini.service.ts`:

```typescript
private apiKey = 'YOUR_API_KEY_HERE';
```

⚠️ **PENTING**: Jangan upload API key ke GitHub publik!

## 🛠️ Cara Menjalankan

### 1. Install Dependencies
```bash
cd tanya-ai
npm install
```

### 2. Jalankan Aplikasi
```bash
npm start
# atau
ionic serve
```

### 3. Buka di Browser
```
http://localhost:8100
```

## 📱 Build untuk Mobile

### Android
```bash
ionic capacitor add android
ionic capacitor build android
```

### iOS (Mac only)
```bash
ionic capacitor add ios
ionic capacitor build ios
```

## 🧪 Testing

### Test Chatbot AI
1. Buka menu "Tanya AI"
2. Ketik: "Buatkan puisi tentang kopi"
3. Tunggu respons dari Gemini

### Test Random User Generator
1. Buka menu "Random User"
2. Klik tombol "Generate User Baru"
3. Lihat data profil yang dihasilkan

### Test Grammar Checker
1. Buka menu "Grammar Checker"
2. Ketik: "She don't like apples"
3. Tunggu 1 detik setelah berhenti mengetik
4. Lihat hasil koreksi grammar

## 📖 Konsep Penting

### Observable vs Promise

```typescript
// PROMISE (async/await)
async getData() {
  const response = await lastValueFrom(
    this.http.get('https://api.example.com')
  );
  return response;
}

// OBSERVABLE
getData() {
  return this.http.get('https://api.example.com').pipe(
    debounceTime(1000),
    switchMap(response => processData(response)),
    catchError(error => handleError(error))
  );
}
```

### RxJS Operators

| Operator | Fungsi |
|----------|--------|
| `debounceTime(ms)` | Tunggu ms milidetik sebelum proses |
| `distinctUntilChanged()` | Hanya proses jika nilai berubah |
| `switchMap(fn)` | Cancel observable lama, buat baru |
| `catchError(fn)` | Handle error tanpa stop stream |
| `map(fn)` | Transform nilai |

## 🐛 Troubleshooting

### Error 401 Unauthorized
- API key tidak valid
- Periksa dan update API key di `gemini.service.ts`

### Error 429 Too Many Requests
- Terlalu banyak request
- Tunggu beberapa saat sebelum mencoba lagi

### Error CORS
- Untuk development di localhost, biasanya aman
- Untuk production, pastikan konfigurasi `capacitor.config.ts` benar

### Error Network
- Periksa koneksi internet
- Pastikan tidak ada firewall yang memblokir

## 📚 Resources

- [Ionic Documentation](https://ionicframework.com/docs)
- [Angular HttpClient](https://angular.io/guide/http)
- [RxJS Documentation](https://rxjs.dev/guide/overview)
- [Google Gemini API](https://ai.google.dev/)
- [Random User API](https://randomuser.me/)

## 👨‍🏫 Dibuat untuk

Mata Kuliah: **Pemrograman Bergerak**  
Topik: HTTP Client, Observable, & Gemini AI Integration  
Dosen: Rosidin, S. Kom., M. Kom.

## 📝 License

MIT License - Dibuat untuk tujuan pembelajaran.
