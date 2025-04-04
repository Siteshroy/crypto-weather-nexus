import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { markAsRead, markAllAsRead, clearNotifications, Notification } from '../redux/features/notificationSlice';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { notifications } = useSelector((state: RootState) => state.notifications);
  const isNotificationsPage = router.pathname === '/notifications';

  if (!isOpen) return null;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'price_alert':
        return '💰';
      case 'weather_alert':
        return '🌤️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return isDarkMode ? 'bg-green-800/20' : 'bg-green-50';
      case 'warning':
        return isDarkMode ? 'bg-yellow-800/20' : 'bg-yellow-50';
      case 'error':
        return isDarkMode ? 'bg-red-800/20' : 'bg-red-50';
      case 'price_alert':
        return isDarkMode ? 'bg-blue-800/20' : 'bg-blue-50';
      case 'weather_alert':
        return isDarkMode ? 'bg-purple-800/20' : 'bg-purple-50';
      case 'info':
      default:
        return isDarkMode ? 'bg-gray-800/20' : 'bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const NotificationsList = () => (
    <div className="overflow-y-auto h-full pb-32">
      {notifications.length === 0 ? (
        <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No notifications yet
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 transition-colors ${getNotificationColor(notification.type)} 
                ${!notification.read && 'font-medium'}`}
              onClick={() => dispatch(markAsRead(notification.id))}
            >
              <div className="flex items-start space-x-3">
                <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // If we're on the notifications page, render without modal wrapper
  if (isNotificationsPage) {
    return (
      <div className={`w-full rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => dispatch(markAllAsRead())}
              className={`px-3 py-1 text-sm rounded-md transition-colors
                ${isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              Mark all as read
            </button>
            <button
              onClick={() => dispatch(clearNotifications())}
              className={`px-3 py-1 text-sm rounded-md transition-colors
                ${isDarkMode 
                  ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400' 
                  : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
            >
              Clear all
            </button>
          </div>
        </div>
        <NotificationsList />
      </div>
    );
  }

  // Modal view for dashboard
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      <div className={`absolute right-0 top-0 h-full w-full max-w-md transform shadow-xl transition-transform
        ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => dispatch(markAllAsRead())}
                className={`px-3 py-1 text-sm rounded-md transition-colors
                  ${isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                Mark all as read
              </button>
              <button
                onClick={() => dispatch(clearNotifications())}
                className={`px-3 py-1 text-sm rounded-md transition-colors
                  ${isDarkMode 
                    ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400' 
                    : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
        <NotificationsList />
      </div>
    </div>
  );
};

export default NotificationsPanel; 