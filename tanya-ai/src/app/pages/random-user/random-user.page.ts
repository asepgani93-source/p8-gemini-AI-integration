import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonMenuButton,
  IonButtons,
  IonChip,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refresh, person, mail, calendar, location, call, menu } from 'ionicons/icons';

/**
 * ============================================
 * RANDOM USER GENERATOR
 * ============================================
 * 
 * STUDI KASUS 1: Menggunakan PROMISE (async/await)
 * 
 * API: https://randomuser.me/api/
 * Fungsi: Generate data profil palsu untuk testing
 * 
 * Konsep Promise:
 * - Sekali jalan (one-time)
 * - Cocok untuk aksi simpel: klik -> request -> response -> selesai
 * - Menggunakan async/await untuk kode yang lebih readable
 * 
 * Cara convert Observable ke Promise:
 * import { lastValueFrom } from 'rxjs';
 * const promise = lastValueFrom(observable);
 */

// Interface untuk data user
interface RandomUser {
  name: {
    first: string;
    last: string;
    title: string;
  };
  email: string;
  phone: string;
  cell: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  dob: {
    date: string;
    age: number;
  };
  location: {
    city: string;
    country: string;
    street: {
      number: number;
      name: string;
    };
  };
  gender: string;
  nat: string;
}

interface RandomUserResponse {
  results: RandomUser[];
  info: {
    seed: string;
    results: number;
    page: number;
    version: string;
  };
}

@Component({
  selector: 'app-random-user',
  templateUrl: 'random-user.page.html',
  styleUrls: ['random-user.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonSpinner,
    IonMenuButton,
    IonButtons,
    IonChip,
    IonLabel,
  ],
})
export class RandomUserPage {
  // Data user yang akan ditampilkan
  user: RandomUser | null = null;
  
  // Status loading
  isLoading = false;
  
  // Error message
  errorMessage = '';

  constructor(private http: HttpClient) {
    // Daftarkan icon
    addIcons({ refresh, person, mail, calendar, location, call, menu });
    
    // Generate user pertama kali
    this.generateUser();
  }

  /**
   * ============================================
   * GENERATE USER - MENGGUNAKAN PROMISE
   * ============================================
   * 
   * Menggunakan async/await dengan Promise
   * Alur:
   * 1. HttpClient mengembalikan Observable
   * 2. Convert ke Promise dengan lastValueFrom()
   * 3. Gunakan await untuk menunggu respons
   * 4. Handle dengan try-catch
   */
  async generateUser() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      // 1. HttpClient.get() mengembalikan Observable
      const observable = this.http.get<RandomUserResponse>(
        'https://randomuser.me/api/'
      );

      // 2. Convert Observable ke Promise dengan lastValueFrom()
      // lastValueFrom = ambil nilai terakhir dari Observable sebagai Promise
      const response: RandomUserResponse = await lastValueFrom(observable);

      // 3. Simpan data user
      this.user = response.results[0];
      
      console.log('User generated:', this.user);
      
    } catch (error) {
      console.error('Error generating user:', error);
      this.errorMessage = 'Gagal mengambil data. Periksa koneksi internet Anda.';
    } finally {
      // 4. Matikan loading (selalu dijalankan)
      this.isLoading = false;
    }
  }

  /**
   * Format tanggal lahir
   */
  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * Get full name
   */
  getFullName(): string {
    if (!this.user) return '';
    return `${this.user.name.title} ${this.user.name.first} ${this.user.name.last}`;
  }

  /**
   * Get full address
   */
  getFullAddress(): string {
    if (!this.user) return '';
    return `${this.user.location.street.number} ${this.user.location.street.name}, ${this.user.location.city}, ${this.user.location.country}`;
  }
}

/**
 * ============================================
 * PERBANDINGAN: PROMISE vs OBSERVABLE
 * ============================================
 * 
 * PROMISE (digunakan di sini):
 * ----------------------------------------
 * async generateUser() {
 *   const response = await lastValueFrom(
 *     this.http.get('https://api.example.com')
 *   );
 *   // Kode lebih readable, mirip synchronous
 * }
 * 
 * OBSERVABLE (alternatif):
 * ----------------------------------------
 * generateUser() {
 *   this.http.get('https://api.example.com').subscribe({
 *     next: (response) => { ... },
 *     error: (err) => { ... }
 *   });
 * }
 * 
 * KAPAN MENGGUNAKAN PROMISE?
 * - Aksi sekali tembak (one-shot)
 * - Tidak butuh pembatalan
 * - Tidak butuh manipulasi stream data
 * - Contoh: Login, simpan data, ambil detail
 * 
 * KAPAN MENGGUNAKAN OBSERVABLE?
 * - Data bisa datang berkali-kali (stream)
 * - Butuh debounce/throttle
 * - Butuh pembatalan request
 * - Contoh: Search autocomplete, chat real-time
 */
