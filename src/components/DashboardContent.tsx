import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { authService } from '../services/authService';
import WeatherSection from './WeatherSection';
import CryptoSection from './CryptoSection';
import NewsSection from './NewsSection';
import { toggleTheme } from '../redux/features/themeSlice';

export default function DashboardContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);
  const isDarkMode = useSelector((state: RootState) => state.theme?.isDarkMode ?? false);
  const [username, setUsername] = useState('Admin');

  useEffect(() => {
    // Check authentication on client side only
    if (!authService.isAuthenticated()) {
      router.push('/login');
    } else {
      const userId = authService.getCurrentUser();
      if (userId) {
        setUsername(localStorage.getItem('username') || 'Admin');
      }
    }
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <>
      <nav className={`${isDarkMode ? 'bg-black' : 'bg-white'} shadow-lg sticky top-0 z-50`}>
        <div className="mx-auto p-4 sm:px-6 lg:px-10">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  CryptoWeather Nexus
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/favorites" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${isDarkMode ? 'text-gray-100 hover:text-gray-900 hover:bg-gray-600' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                Favorites
              </Link>
              <Link 
                href="/notifications" 
                className={`relative p-2 rounded-full hover:text-gray-900 ${isDarkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <span className="sr-only">Notifications</span>
                <svg className={`h-6 w-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className={`absolute top-0 right-0 block h-5 w-5 rounded-full ${isDarkMode ? 'bg-red-500 text-white' : 'bg-red-500 text-white'} text-xs text-center leading-5`}>
                    {unreadCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`shadow-lg rounded-full flex items-center space-x-2 pr-2 ${isDarkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} focus:outline-none`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-medium">{username.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-700'} hidden md:block`}>{username}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                
                  {showProfileMenu && (
                    <div className={`absolute right-0 mt-2 w-48 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl py-2 z-10`}>
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-red-600 hover:bg-gray-600' : 'text-red-600 hover:bg-red-50'}`}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-md ${isDarkMode ? 'text-gray-100 hover:text-gray-900 hover:bg-gray-600' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className={`block h-6 w-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className={`block h-6 w-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/favorites"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Favorites
            </Link>
            <Link
              href="/notifications"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn space-y-8">
          {/* Welcome Section with Dark Mode Toggle */}
          <div className={`${isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-500 to-purple-500'} rounded-2xl p-8 text-white shadow-xl transition-colors duration-200`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome to CryptoWeatherNexus</h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-blue-100'}`}>
                  Your all-in-one dashboard for weather updates, crypto tracking, and latest news.
                </p>
              </div>
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-lg bg-opacity-20 bg-white hover:bg-opacity-30 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Weather Section */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg transition-colors duration-200`}>
              <WeatherSection isDarkMode={isDarkMode} />
            </div>

            {/* Crypto and News Sections */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Crypto Section - Spans 3 columns on xl screens */}
              <div className={`xl:col-span-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg transition-colors duration-200`}>
                <CryptoSection isDarkMode={isDarkMode} />
              </div>

              {/* News Section */}
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg transition-colors duration-200`}>
                <NewsSection isDarkMode={isDarkMode} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t mt-auto`}>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className={`text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-500'} text-sm`}>
            © 2024 CryptoWeather Nexus. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
} 