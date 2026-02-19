import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
  map,
} from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonTextarea,
  IonSpinner,
  IonIcon,
  IonCard,
  IonCardContent,
  IonChip,
  IonLabel,
  IonMenuButton,
  IonButtons,
  IonBadge,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle, menu, language, time } from 'ionicons/icons';

/**
 * ============================================
 * LIVE GRAMMAR CHECKER
 * ============================================
 * 
 * STUDI KASUS 2: Menggunakan OBSERVABLE dengan RxJS Operators
 * 
 * Fitur:
 * - Pengecek grammar bahasa Inggris real-time
 * - Tidak ada tombol "Cek" - otomatis saat mengetik
 * - Menggunakan debounceTime untuk menghemat API call
 * - Menggunakan switchMap untuk cancel request lama
 * 
 * Operator RxJS yang digunakan:
 * 1. debounceTime(1000) - Tunggu 1 detik setelah user berhenti mengetik
 * 2. distinctUntilChanged() - Hanya proses jika teks berubah
 * 3. switchMap() - Cancel request lama jika ada input baru
 * 4. catchError() - Handle error dengan graceful
 */

// Interface untuk hasil grammar
interface GrammarResult {
  status: 'Correct' | 'Incorrect';
  correction: string;
  originalText: string;
}

@Component({
  selector: 'app-grammar-checker',
  templateUrl: 'grammar-checker.page.html',
  styleUrls: ['grammar-checker.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonTextarea,
    IonSpinner,
    IonIcon,
    IonCard,
    IonCardContent,
    IonChip,
    IonLabel,
    IonMenuButton,
    IonButtons,
    IonBadge,
    IonButton,
  ],
})
export class GrammarCheckerPage implements OnInit, OnDestroy {
  // Teks yang diinput user
  userText = '';

  // Subject untuk menangani perubahan teks
  // Subject adalah Observable yang bisa di-emit (next) secara manual
  private textSubject = new Subject<string>();

  // Subscription untuk unsubscribe saat component destroy
  private grammarSubscription: Subscription | null = null;

  // Hasil pengecekan grammar
  grammarResult: GrammarResult | null = null;

  // Status loading
  isChecking = false;

  // Error message
  errorMessage = '';

  // Waktu terakhir pengecekan
  lastChecked: Date | null = null;

  // Konfigurasi API Gemini
  private apiKey = 'AIzaSyDuLX78wvWDL4eiPRs9w0Xpd1PBVnR8g9E';
  private apiUrl =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  constructor(private http: HttpClient) {
    // Daftarkan icon
    addIcons({ checkmarkCircle, closeCircle, menu, language, time });
  }

  /**
   * ============================================
   * NGONINIT - SETUP OBSERVABLE PIPELINE
   * ============================================
   * 
   * Membuat pipeline Observable yang akan:
   * 1. Menerima perubahan teks dari user
   * 2. Debounce (tunggu) 1 detik
   * 3. Hanya proses jika teks berbeda dari sebelumnya
   * 4. Cancel request lama jika ada input baru
   * 5. Panggil API grammar check
   * 6. Handle error dengan catchError
   */
  ngOnInit() {
    // Setup pipeline Observable
    this.grammarSubscription = this.textSubject
      .pipe(
        // 1. debounceTime(1000)
        // Tunggu 1 detik setelah user berhenti mengetik
        // Ini menghemat API call - tidak setiap huruf diproses
        debounceTime(1000),

        // 2. distinctUntilChanged()
        // Hanya lanjutkan jika teks berbeda dari sebelumnya
        // Mencegah pemrosesan duplikat
        distinctUntilChanged(),

        // 3. switchMap()
        // Transform setiap teks menjadi Observable (HTTP request)
        // Jika ada teks baru sebelum request selesai, cancel request lama
        // Ini mencegah race condition dan response yang tertukar
        switchMap((text) => {
          if (!text.trim()) {
            // Jika teks kosong, return null
            return of(null);
          }

          this.isChecking = true;
          this.errorMessage = '';

          // Panggil API grammar check
          return this.checkGrammarWithAI(text).pipe(
            // 4. catchError()
            // Handle error dengan graceful
            // Jika error, return null dan lanjutkan stream
            catchError((error) => {
              console.error('Grammar check error:', error);
              this.errorMessage =
                'Gagal memeriksa grammar. Periksa koneksi atau API key.';
              return of(null);
            })
          );
        })
      )
      // Subscribe untuk menerima hasil
      .subscribe({
        next: (result) => {
          this.isChecking = false;

          if (result) {
            this.grammarResult = result;
            this.lastChecked = new Date();
          } else if (!this.userText.trim()) {
            // Reset jika teks kosong
            this.grammarResult = null;
          }
        },
        error: (err) => {
          console.error('Subscription error:', err);
          this.isChecking = false;
        },
      });
  }

  /**
   * ============================================
   * NGONDESTROY - CLEANUP
   * ============================================
   * 
   * Penting untuk unsubscribe saat component di-destroy
   * Mencegah memory leak dan callback yang tidak diinginkan
   */
  ngOnDestroy() {
    if (this.grammarSubscription) {
      this.grammarSubscription.unsubscribe();
    }
  }

  /**
   * Dipanggil saat user mengetik
   * Emit nilai baru ke Subject
   */
  onTextChange(text: string) {
    this.userText = text;
    this.textSubject.next(text);
  }

  /**
   * ============================================
   * CHECK GRAMMAR WITH AI
   * ============================================
   * 
   * Memanggil Gemini AI untuk memeriksa grammar
   * Mengembalikan Observable<GrammarResult>
   * 
   * Prompt ke AI:
   * "Check grammar for: [TEKS]. 
   *  Return valid JSON { "status": "Correct/Incorrect", "correction": "..." }"
   */
  private checkGrammarWithAI(text: string): Observable<GrammarResult | null> {
    const url = `${this.apiUrl}?key=${this.apiKey}`;

    const grammarPrompt = `Check grammar for: "${text}". Return valid JSON format only: { "status": "Correct" or "Incorrect", "correction": "explanation or corrected text" }`;

    const body = {
      contents: [
        {
          parts: [{ text: grammarPrompt }],
        },
      ],
    };

    return this.http.post<any>(url, body).pipe(
      map((response) => {
        try {
          // Parse respons dari AI
          const aiText = response.candidates[0].content.parts[0].text;

          // Coba parse JSON dari respons AI
          // AI kadang mengembalikan JSON di dalam markdown code block
          let jsonStr = aiText;

          // Hapus markdown code block jika ada
          if (aiText.includes('```json')) {
            jsonStr = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          } else if (aiText.includes('```')) {
            jsonStr = aiText.replace(/```\n?/g, '');
          }

          // Trim whitespace
          jsonStr = jsonStr.trim();

          // Parse JSON
          const parsed = JSON.parse(jsonStr);

          return {
            status: parsed.status,
            correction: parsed.correction,
            originalText: text,
          } as GrammarResult;
        } catch (error) {
          console.error('Error parsing AI response:', error);
          // Fallback jika parsing gagal
          return {
            status: 'Incorrect',
            correction:
              'Tidak dapat memparse respons AI. Silakan coba lagi.',
            originalText: text,
          } as GrammarResult;
        }
      })
    );
  }

  /**
   * Clear text dan reset state
   */
  clearText() {
    this.userText = '';
    this.grammarResult = null;
    this.errorMessage = '';
    this.lastChecked = null;
  }

  /**
   * Get status color untuk badge
   */
  getStatusColor(): string {
    if (!this.grammarResult) return 'medium';
    return this.grammarResult.status === 'Correct' ? 'success' : 'danger';
  }

  /**
   * Format waktu terakhir pengecekan
   */
  getFormattedTime(): string {
    if (!this.lastChecked) return '';
    return this.lastChecked.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}

/**
 * ============================================
 * KONSEP OBSERVABLE & RxJS OPERATORS
 * ============================================
 *
 * 1. SUBJECT
 *    ----------------------------------------
 *    Subject adalah Observable yang bisa di-emit secara manual.
 *    Cocok untuk event-driven programming.
 *
 *    this.textSubject.next('teks baru') -> emit nilai
 *
 * 2. DEBOUNCETIME
 *    ----------------------------------------
 *    Menunggu selama waktu tertentu sebelum memproses.
 *    Jika ada nilai baru dalam waktu tunggu, reset timer.
 *
 *    .pipe(debounceTime(1000))
 *    -> Tunggu 1 detik setelah user berhenti mengetik
 *
 * 3. DISTINCTUNTILCHANGED
 *    ----------------------------------------
 *    Hanya lanjutkan jika nilai berbeda dari sebelumnya.
 *
 *    .pipe(distinctUntilChanged())
 *    -> Hindari proses duplikat
 *
 * 4. SWITCHMAP
 *    ----------------------------------------
 *    Transform setiap nilai menjadi Observable baru.
 *    Cancel Observable lama jika ada nilai baru.
 *
 *    .pipe(switchMap(text => this.http.post(...)))
 *    -> Cancel request HTTP lama jika user mengetik lagi
 *
 * 5. CATCHERROR
 *    ----------------------------------------
 *    Tangkap error dan return nilai fallback.
 *    Mencegah stream berhenti karena error.
 *
 *    .pipe(catchError(err => of(null)))
 *    -> Return null jika error, stream tetap berjalan
 *
 * ============================================
 * ALUR KERJA
 * ============================================
 *
 * User mengetik -> textSubject.next(text)
 *                        |
 *                        v
 *              [debounceTime(1000)]
 *              Tunggu 1 detik...
 *                        |
 *                        v
 *         [distinctUntilChanged()]
 *         Cek apakah teks berubah?
 *                        |
 *                        v
 *              [switchMap(text => ...)]
 *              Cancel request lama (jika ada)
 *              Kirim request baru ke AI
 *                        |
 *                        v
 *              [catchError(err => ...)]
 *              Handle error gracefully
 *                        |
 *                        v
 *              Subscribe -> Update UI
 */