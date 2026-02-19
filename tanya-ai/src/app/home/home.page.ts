import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonList,
  IonLabel,
  IonSpinner,
  IonMenuButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { send, menu } from 'ionicons/icons';

// Import Service Gemini
import { GeminiService } from '../services/gemini.service';

/**
 * ============================================
 * HOMEPAGE - CHATBOT AI (Tanya Pak AI)
 * ============================================
 * 
 * Fitur:
 * - Chat interface mirip WhatsApp
 * - Menggunakan Observable (RxJS) untuk komunikasi dengan AI
 * - Loading indicator saat menunggu respons
 * - Error handling
 * 
 * Konsep Observable:
 * - Data bisa datang berkali-kali (stream)
 * - Bisa di-cancel (unsubscribe)
 * - Sangat powerful untuk data real-time
 */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonList,
    IonLabel,
    IonSpinner,
    IonMenuButton,
    IonButtons,
  ],
})
export class HomePage {
  // Input dari user
  userInput = '';
  
  // Riwayat chat: menyimpan pesan user dan respons AI
  chatHistory: { role: 'user' | 'model'; text: string }[] = [];
  
  // Status loading: true saat menunggu respons AI
  isLoading = false;

  constructor(private geminiService: GeminiService) {
    // Daftarkan icon yang digunakan
    addIcons({ send, menu });
  }

  /**
   * Mengirim pesan ke AI
   * Alur:
   * 1. Tampilkan pesan user di layar
   * 2. Kosongkan input
   * 3. Nyalakan loading
   * 4. Panggil service AI dengan Observable
   * 5. Subscribe untuk menerima respons
   * 6. Tampilkan jawaban AI
   * 7. Matikan loading
   */
  kirimPesan() {
    // Validasi: jangan kirim jika input kosong
    if (!this.userInput.trim()) return;

    // 1. Simpan pesan user dan tampilkan di layar
    const pesanUser = this.userInput;
    this.chatHistory.push({ role: 'user', text: pesanUser });

    // 2. Kosongkan input field
    this.userInput = '';

    // 3. Nyalakan loading indicator
    this.isLoading = true;

    // 4. Panggil Service AI dengan Observable
    // Menggunakan subscribe() untuk mendengarkan respons
    this.geminiService.generateText(pesanUser).subscribe({
      // 5. Callback next: dipanggil saat data diterima
      next: (response) => {
        try {
          // 6. Ambil jawaban dari struktur JSON Google Gemini
          // Struktur: candidates[0].content.parts[0].text
          const jawabanAI = response.candidates[0].content.parts[0].text;

          // 7. Tampilkan jawaban AI di layar
          this.chatHistory.push({ role: 'model', text: jawabanAI });
        } catch (error) {
          // Error parsing response
          console.error('Error parsing response:', error);
          this.chatHistory.push({
            role: 'model',
            text: 'Maaf, terjadi kesalahan saat memproses respons AI.',
          });
        }

        // 8. Matikan loading
        this.isLoading = false;
      },

      // Callback error: dipanggil saat terjadi error
      error: (err) => {
        console.error('Error:', err);
        
        // Tampilkan pesan error yang sesuai
        let errorMessage = 'Maaf, AI sedang pusing (Error koneksi).';
        
        if (err.status === 400) {
          errorMessage = 'Permintaan tidak valid. Coba pertanyaan lain.';
        } else if (err.status === 401) {
          errorMessage = 'API Key tidak valid. Silakan periksa konfigurasi.';
        } else if (err.status === 429) {
          errorMessage = 'Terlalu banyak permintaan. Silakan tunggu sebentar.';
        } else if (err.status === 0) {
          errorMessage = 'Tidak ada koneksi internet. Periksa jaringan Anda.';
        }

        this.chatHistory.push({
          role: 'model',
          text: errorMessage,
        });

        this.isLoading = false;
      },
    });
  }

  /**
   * Handle enter key di input field
   */
  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.kirimPesan();
    }
  }
}

/**
 * ============================================
 * KONSEP OBSERVABLE YANG DIGUNAKAN
 * ============================================
 * 
 * this.geminiService.generateText(pesanUser).subscribe({
 *   next: (response) => { ... },    // Data diterima
 *   error: (err) => { ... },         // Error terjadi
 *   complete: () => { ... }          // Stream selesai (optional)
 * });
 * 
 * Keunggulan Observable:
 * 1. Bisa handle multiple data (stream)
 * 2. Bisa di-cancel dengan unsubscribe()
 * 3. Bisa chaining dengan operator RxJS
 * 4. Error handling terpisah
 * 5. Cocok untuk data real-time
 */
