import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import NotificationsPanel from '../../components/NotificationsPanel';

const NotificationsPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('userId');
    }
    return false;
  });

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
    return null;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Notifications
          </h1>
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-lg transition-colors duration-200
              ${isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-900'} 
              shadow-sm`}
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Always show notifications panel on this page */}
        <NotificationsPanel isOpen={true} onClose={() => router.push('/dashboard')} />
      </div>
    </div>
  );
};

export default NotificationsPage; 