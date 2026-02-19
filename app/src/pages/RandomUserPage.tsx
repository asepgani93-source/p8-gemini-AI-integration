import { useState, useEffect } from 'react';
import { RefreshCw, Mail, Calendar, MapPin, Phone, Globe, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * ============================================
 * RANDOM USER GENERATOR PAGE
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
 */

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

export default function RandomUserPage() {
  const [user, setUser] = useState<RandomUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate user saat pertama kali load
  useEffect(() => {
    generateUser();
  }, []);

  /**
   * ============================================
   * GENERATE USER - MENGGUNAKAN PROMISE
   * ============================================
   * 
   * Menggunakan async/await dengan Promise
   * Alur:
   * 1. Fetch API mengembalikan Promise
   * 2. Gunakan await untuk menunggu respons
   * 3. Handle dengan try-catch
   */
  const generateUser = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Fetch API mengembalikan Promise
      const response = await fetch('https://randomuser.me/api/');

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      // 2. response.json() juga mengembalikan Promise
      const data: RandomUserResponse = await response.json();

      // 3. Simpan data user
      setUser(data.results[0]);
      
      console.log('User generated:', data.results[0]);
    } catch (err: any) {
      console.error('Error generating user:', err);
      setError('Gagal mengambil data. Periksa koneksi internet Anda.');
    } finally {
      // 4. Matikan loading (selalu dijalankan)
      setIsLoading(false);
    }
  };

  const getFullName = (): string => {
    if (!user) return '';
    return `${user.name.title} ${user.name.first} ${user.name.last}`;
  };

  const getFullAddress = (): string => {
    if (!user) return '';
    return `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.country}`;
  };

  const getFormattedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Random User Generator</h1>
        <p className="text-gray-600">Generate data profil palsu untuk keperluan testing</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Mengambil data...</p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="max-w-md mx-auto text-center py-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={generateUser} variant="outline" className="rounded-full">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* User Card */}
      {user && !isLoading && (
        <Card className="max-w-md mx-auto overflow-hidden shadow-xl">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
            <div className="relative inline-block">
              <img
                src={user.picture.large}
                alt={getFullName()}
                className="w-28 h-28 rounded-full border-4 border-white shadow-lg mx-auto"
              />
              <Badge 
                className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${
                  user.gender === 'male' ? 'bg-blue-600' : 'bg-pink-500'
                }`}
              >
                {user.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold mt-4">{getFullName()}</h2>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="text-gray-800">{user.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Telepon</p>
                <p className="text-gray-800">{user.phone}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Alamat</p>
                <p className="text-gray-800">{getFullAddress()}</p>
              </div>
            </div>

            {/* Birth Date */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Tanggal Lahir</p>
                <p className="text-gray-800">{getFormattedDate(user.dob.date)} ({user.dob.age} tahun)</p>
              </div>
            </div>

            {/* Nationality */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Globe className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 uppercase">Nationality</p>
                <p className="text-gray-800">{user.nat}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      <div className="max-w-md mx-auto mt-6">
        <Button
          onClick={generateUser}
          disabled={isLoading}
          className="w-full py-6 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Generate User Baru
        </Button>
      </div>

      {/* Info Card */}
      <Card className="max-w-md mx-auto mt-8 bg-gradient-to-br from-gray-50 to-gray-100 border-0">
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-800 mb-3">💡 Info Teknis</h3>
          <p className="text-sm text-gray-600 mb-3">
            <strong>Menggunakan Promise (async/await)</strong>
          </p>
          <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
            <li>Fetch API mengembalikan Promise</li>
            <li>Menggunakan <code className="bg-gray-200 px-1 rounded">async/await</code> untuk readability</li>
            <li>Cocok untuk aksi sekali klik = satu data</li>
            <li>Error handling dengan try-catch</li>
          </ul>
          <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-300">
            API: <a href="https://randomuser.me" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">randomuser.me</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
