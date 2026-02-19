import { useState } from 'react';
import { Menu, MessageSquare, User, Languages, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ChatbotPage from './pages/ChatbotPage';
import RandomUserPage from './pages/RandomUserPage';
import GrammarCheckerPage from './pages/GrammarCheckerPage';

type Page = 'chatbot' | 'random-user' | 'grammar-checker';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('chatbot');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'chatbot' as Page, label: 'Tanya AI', icon: MessageSquare, color: 'text-purple-600' },
    { id: 'random-user' as Page, label: 'Random User', icon: User, color: 'text-blue-600' },
    { id: 'grammar-checker' as Page, label: 'Grammar Checker', icon: Languages, color: 'text-green-600' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'chatbot':
        return <ChatbotPage />;
      case 'random-user':
        return <RandomUserPage />;
      case 'grammar-checker':
        return <GrammarCheckerPage />;
      default:
        return <ChatbotPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <h1 className="text-2xl font-bold">Tanya AI</h1>
          <p className="text-sm opacity-90 mt-1">Belajar HTTP Client & Observable</p>
        </div>
        
        <nav className="flex-1 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Menu Aplikasi
          </p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                currentPage === item.id
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentPage === item.id ? item.color : 'text-gray-500'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BookOpen className="w-4 h-4" />
            <span>Pemrograman Bergerak</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 px-6">HTTP Client & Gemini AI</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <h1 className="text-xl font-bold">Tanya AI</h1>
                  <p className="text-xs opacity-90 mt-1">Belajar HTTP Client & Observable</p>
                </div>
                <nav className="p-4">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                        currentPage === item.id
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${currentPage === item.id ? item.color : 'text-gray-500'}`} />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold">
              {menuItems.find(item => item.id === currentPage)?.label}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-0 pt-16 md:pt-0">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
