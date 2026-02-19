import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, XCircle, Languages, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { checkGrammar, type GrammarResult } from '@/services/geminiService';

/**
 * ============================================
 * LIVE GRAMMAR CHECKER PAGE
 * ============================================
 * 
 * STUDI KASUS 2: Menggunakan DEBOUNCE (Simulasi RxJS)
 * 
 * Fitur:
 * - Pengecek grammar bahasa Inggris real-time
 * - Tanpa tombol "Cek" - otomatis saat mengetik
 * - Debounce 1 detik untuk menghemat API call
 * - Cancel request lama jika ada input baru
 * 
 * Konsep Debounce:
 * - Tunggu selama waktu tertentu sebelum memproses
 * - Jika ada input baru dalam waktu tunggu, reset timer
 * - Ini menghemat API call - tidak setiap huruf diproses
 */

export default function GrammarCheckerPage() {
  const [userText, setUserText] = useState('');
  const [grammarResult, setGrammarResult] = useState<GrammarResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  
  // Ref untuk menyimpan timeout ID
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref untuk menyimpan abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * ============================================
   * DEBOUNCE FUNCTION
   * ============================================
   * 
   * Fungsi debounce yang menunggu selama delay ms
   * sebelum menjalankan fungsi.
   * 
   * Jika dipanggil lagi dalam waktu delay, timer di-reset.
   * Ini mirip dengan operator debounceTime di RxJS.
   */
  const debouncedCheckGrammar = useCallback((text: string) => {
    // Clear timeout sebelumnya jika ada
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Cancel request sebelumnya jika ada
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset state
    setIsWaiting(true);
    setIsChecking(false);
    setError('');

    // Jika teks kosong, reset result
    if (!text.trim()) {
      setGrammarResult(null);
      setIsWaiting(false);
      return;
    }

    // Set timeout baru (debounce 1000ms = 1 detik)
    debounceTimeoutRef.current = setTimeout(async () => {
      setIsWaiting(false);
      setIsChecking(true);

      // Buat abort controller baru
      abortControllerRef.current = new AbortController();

      try {
        const result = await checkGrammar(text);
        setGrammarResult(result);
        setLastChecked(new Date());
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Grammar check error:', err);
          setError('Gagal memeriksa grammar. Periksa koneksi atau API key.');
        }
      } finally {
        setIsChecking(false);
      }
    }, 1000); // Debounce 1 detik
  }, []);

  // Cleanup saat component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setUserText(text);
    debouncedCheckGrammar(text);
  };

  const clearText = () => {
    setUserText('');
    setGrammarResult(null);
    setError('');
    setLastChecked(null);
    setIsWaiting(false);
    setIsChecking(false);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const getFormattedTime = (): string => {
    if (!lastChecked) return '';
    return lastChecked.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Live Grammar Checker</h1>
        <p className="text-gray-600">Ketik dalam bahasa Inggris, AI akan memeriksa grammar secara otomatis</p>
      </div>

      {/* Input Section */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Languages className="w-3 h-3" />
            Teks Bahasa Inggris
          </Badge>
          <span className={`text-sm ${userText.length > 500 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
            {userText.length} karakter
          </span>
        </div>

        <textarea
          value={userText}
          onChange={handleTextChange}
          placeholder={`Ketik kalimat bahasa Inggris di sini...\nContoh: She don't like apples.\nAI akan memeriksa grammar secara otomatis setelah Anda berhenti mengetik 1 detik.`}
          className="w-full min-h-[150px] p-4 border-2 border-gray-200 rounded-xl resize-y focus:outline-none focus:border-green-500 transition-colors text-base"
          rows={5}
        />

        {userText && (
          <div className="flex justify-end mt-2">
            <button
              onClick={clearText}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Hapus Teks
            </button>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {userText.trim() && (
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-center gap-2 text-sm text-gray-600">
            {isChecking ? (
              <>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span>Memeriksa grammar...</span>
              </>
            ) : isWaiting ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Menunggu Anda berhenti mengetik...</span>
              </>
            ) : lastChecked ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Terakhir diperiksa: {getFormattedTime()}</span>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Grammar Result */}
      {grammarResult && !isChecking && (
        <div className="max-w-2xl mx-auto mb-8">
          <Card className={`overflow-hidden ${
            grammarResult.status === 'Correct' 
              ? 'border-l-4 border-l-green-500' 
              : 'border-l-4 border-l-red-500'
          }`}>
            <CardContent className="p-6">
              {/* Status Badge */}
              <div className="mb-4">
                <Badge 
                  className={`text-sm py-1 px-3 ${
                    grammarResult.status === 'Correct'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                  }`}
                >
                  {grammarResult.status === 'Correct' ? (
                    <><CheckCircle className="w-4 h-4 mr-1" /> Grammar Benar</>
                  ) : (
                    <><XCircle className="w-4 h-4 mr-1" /> Grammar Salah</>
                  )}
                </Badge>
              </div>

              {/* Original Text */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Teks Asli
                </h4>
                <p className="italic text-gray-600 bg-gray-50 p-3 rounded-lg">
                  "{grammarResult.originalText}"
                </p>
              </div>

              {/* Correction */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {grammarResult.status === 'Correct' ? 'Penjelasan' : 'Koreksi'}
                </h4>
                <p className={`p-3 rounded-lg ${
                  grammarResult.status === 'Correct'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}>
                  {grammarResult.correction}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tech Info */}
      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-0">
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            Teknis: Debounce Pattern
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <Badge className="bg-green-200 text-green-800 hover:bg-green-200 mt-0.5">1</Badge>
              <div>
                <p className="font-medium text-gray-800">Debounce (1000ms)</p>
                <p className="text-sm text-gray-600">Tunggu 1 detik setelah user berhenti mengetik</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="bg-emerald-200 text-emerald-800 hover:bg-emerald-200 mt-0.5">2</Badge>
              <div>
                <p className="font-medium text-gray-800">Cancel Request Lama</p>
                <p className="text-sm text-gray-600">AbortController untuk membatalkan fetch sebelumnya</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="bg-teal-200 text-teal-800 hover:bg-teal-200 mt-0.5">3</Badge>
              <div>
                <p className="font-medium text-gray-800">Kirim ke AI</p>
                <p className="text-sm text-gray-600">Panggil Gemini API dengan teks terbaru</p>
              </div>
            </div>
          </div>

          <div className="border-t border-green-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Alur Kerja:</h4>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-white px-3 py-1.5 rounded border border-green-200 text-gray-700">User mengetik</span>
              <span className="text-green-500">→</span>
              <span className="bg-white px-3 py-1.5 rounded border border-green-200 text-gray-700">Debounce 1s</span>
              <span className="text-green-500">→</span>
              <span className="bg-white px-3 py-1.5 rounded border border-green-200 text-gray-700">Cancel request lama</span>
              <span className="text-green-500">→</span>
              <span className="bg-white px-3 py-1.5 rounded border border-green-200 text-gray-700">Kirim ke AI</span>
              <span className="text-green-500">→</span>
              <span className="bg-white px-3 py-1.5 rounded border border-green-200 text-gray-700">Update UI</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
