import React from 'react';

interface WeatherHistory {
  timestamp: number;
  temperature: number;
  humidity: number;
}

interface WeatherData {
  id: string;
  city: string;
  state?: string;
  country: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  conditions: string;
  alert?: string;
  history: Array<{
    timestamp: number;
    temperature: number;
    humidity: number;
  }>;
}

interface WeatherDetailModalProps {
  cityData: WeatherData;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isDarkMode: boolean;
}

const WeatherDetailModal: React.FC<WeatherDetailModalProps> = ({
  cityData,
  onClose,
  isFavorite,
  onToggleFavorite,
  isDarkMode,
}) => {
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4`}>
      <div className={`rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {cityData.city}
                <span className={`text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>
                  {cityData.state && `${cityData.state}, `}{cityData.country}
                </span>
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleFavorite}
                className="text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
              >
                {isFavorite ? (
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                )}
              </button>
              <button
                onClick={onClose}
                className={`transition-colors duration-200 hover:text-gray-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-baseline">
                <p className={`text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{Math.round(cityData.temperature)}°C</p>
                <p className={`ml-2 text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{cityData.conditions}</p>
              </div>
              <div className="mt-4 space-y-3">
                <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Humidity: {cityData.humidity}%</span>
                </div>
                {cityData.windSpeed && (
                  <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span>Wind Speed: {cityData.windSpeed} m/s</span>
                  </div>
                )}
                {cityData.pressure && (
                  <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span>Pressure: {cityData.pressure} hPa</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>24-Hour Forecast</h3>
              {cityData.history && cityData.history.length > 0 ? (
                <div className="space-y-2">
                  {cityData.history.map((record: WeatherHistory, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                      <span>{Math.round(record.temperature)}°C</span>
                      <span>{record.humidity}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No forecast data available</p>
              )}
            </div>
          </div>

          {cityData.alert && (
              <div className={`mt-6 p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-red-50'} border border-red-200 rounded-lg`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-700'} mb-2`}>Weather Alert</h3>
              <p className={`${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>{cityData.alert}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherDetailModal; 