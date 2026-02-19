import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { generateText } from '@/services/geminiService';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

/**
 * ============================================
 * CHATBOT AI PAGE (TANYA PAK AI)
 * ============================================
 * 
 * Fitur:
 * - Chat interface mirip WhatsApp
 * - Menggunakan PROMISE (async/await) dengan Fetch API
 * - Loading indicator saat menunggu respons
 * - Error handling
 * 
 * Konsep Promise:
 * - Sekali jalan (one-time)
 * - Cocok untuk aksi simpel: klik -> request -> response -> selesai
 * - Menggunakan async/await untuk kode yang lebih readable
 */

export default function ChatbotPage() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  /**
   * Mengirim pesan ke AI
   * Alur:
   * 1. Tampilkan pesan user di layar
   * 2. Kosongkan input
   * 3. Nyalakan loading
   * 4. Panggil service AI dengan Promise
   * 5. Tampilkan jawaban AI
   * 6. Matikan loading
   */
  const kirimPesan = async () => {
    if (!userInput.trim()) return;

    const pesanUser = userInput;
    
    // 1. Tampilkan pesan user
    setChatHistory(prev => [...prev, { role: 'user', text: pesanUser }]);
    
    // 2. Kosongkan input
    setUserInput('');
    
    // 3. Nyalakan loading
    setIsLoading(true);
    setError('');

    try {
      // 4. Panggil Service AI dengan Promise (async/await)
      const jawabanAI = await generateText(pesanUser);
      
      // 5. Tampilkan jawaban AI
      setChatHistory(prev => [...prev, { role: 'model', text: jawabanAI }]);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Maaf, AI sedang pusing (Error koneksi).');
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        text: err.message || 'Maaf, terjadi kesalahan. Silakan coba lagi.' 
      }]);
    } finally {
      // 6. Matikan loading
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      kirimPesan();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header - Desktop */}
      <div className="hidden md:flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <Bot className="w-8 h-8" />
        <div>
          <h1 className="text-xl font-bold">Tanya Pak AI</h1>
          <p className="text-sm opacity-90">Powered by Google Gemini</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang!</h2>
            <p className="text-gray-600 mb-4">Mulai percakapan dengan AI Gemini.</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Contoh:</p>
              <p className="bg-gray-200 px-3 py-1 rounded-full">"Buatkan puisi tentang kopi"</p>
              <p className="bg-gray-200 px-3 py-1 rounded-full">"Jelaskan apa itu Ionic"</p>
            </div>
          </div>
        )}

        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-purple-600" />
                )}
                <span className={`text-xs font-medium ${msg.role === 'user' ? 'text-white/80' : 'text-gray-500'}`}>
                  {msg.role === 'user' ? 'Saya' : 'Bot AI'}
                </span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">Bot AI</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-sm text-gray-500">Sedang mengetik...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            placeholder="Tulis pertanyaan..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 rounded-full px-4 py-3 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          />
          <Button
            onClick={kirimPesan}
            disabled={isLoading || !userInput.trim()}
            className="rounded-full px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        {error && (
          <p className="text-center text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
