import React, { useState } from 'react';
import { useRouter } from 'next/router';

const Header: React.FC = () => {
  const router = useRouter();
  const username = localStorage.getItem('username') || 'Admin';
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    router.push('/');
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h1 className="ml-2 text-2xl font-bold text-white">
                CryptoWeather
                <span className="text-yellow-300">Nexus</span>
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8 ml-10">
              <a href="#weather" className="text-gray-100 hover:text-yellow-300 transition-colors">Weather</a>
              <a href="#crypto" className="text-gray-100 hover:text-yellow-300 transition-colors">Crypto</a>
              <a href="#news" className="text-gray-100 hover:text-yellow-300 transition-colors">News</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 text-white focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-medium">{username.charAt(0).toUpperCase()}</span>
                </div>
                <span className="hidden md:block">{username}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-10">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 