import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchCryptoData } from '../redux/features/cryptoSlice';
import { fetchWeatherData } from '../redux/features/weatherSlice';
import Link from 'next/link';
import { useTheme } from 'next-themes';

const FavoritesPage = () => {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { theme, systemTheme } = useTheme();
  const reduxDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  // Get the current theme
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDarkMode = mounted ? (currentTheme === 'dark' || reduxDarkMode) : false;


  // Redux state
  const crypto = useSelector((state: RootState) => state.crypto);
  const weather = useSelector((state: RootState) => state.weather);
  
  // Local state for animations
  

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (crypto.favorites.length > 0) {
      dispatch(fetchCryptoData(crypto.favorites));
    }
    if (weather.favorites.length > 0) {
      dispatch(fetchWeatherData(weather.favorites));
    }

    // Refresh data every minute
    const interval = setInterval(() => {
      if (crypto.favorites.length > 0) {
        dispatch(fetchCryptoData(crypto.favorites));
      }
      if (weather.favorites.length > 0) {
        dispatch(fetchWeatherData(weather.favorites));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch, crypto.favorites, weather.favorites]);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Your Favorites
          </h1>
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-lg transition-colors duration-200
              ${isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-900'} 
              shadow-sm`}
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Favorite Cryptocurrencies */}
        <div className="mb-8">
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Favorite Cryptocurrencies
          </h2>
          {crypto.favorites.length === 0 ? (
            <div className={`rounded-lg p-6 text-center ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-500'}`}>
              No favorite cryptocurrencies yet. Add some from the dashboard!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crypto.favorites.map((coinId) => {
                const coinData = crypto.data[coinId];
                if (!coinData) return null;

                return (
                  <Link
                    href={`/crypto/${coinId}`}
                    key={coinId}
                    className={`rounded-lg p-6 transition-all duration-200 transform hover:scale-102
                      ${isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-white hover:bg-gray-50'} 
                      shadow-sm hover:shadow-md`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {coinData.name}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {coinData.symbol.toUpperCase()}
                        </p>
                      </div>
                      <div className={`text-right ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        <p className="text-2xl font-bold">${coinData.price.toLocaleString()}</p>
                        <p className={`text-sm ${coinData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {coinData.priceChange24h.toFixed(2)}% (24h)
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Favorite Weather Locations */}
        <div>
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Favorite Weather Locations
          </h2>
          {weather.favorites.length === 0 ? (
            <div className={`rounded-lg p-6 text-center ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-500'}`}>
              No favorite weather locations yet. Add some from the dashboard!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weather.favorites.map((cityId) => {
                const cityData = weather.data[cityId];
                if (!cityData) return null;

                return (
                  <Link
                    href={`/weather/${cityId}`}
                    key={cityId}
                    className={`rounded-lg p-6 transition-all duration-200 transform hover:scale-102
                      ${isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-white hover:bg-gray-50'} 
                      shadow-sm hover:shadow-md`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {cityData.city}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {cityData.country}
                        </p>
                      </div>
                      <div className={`text-right ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        <p className="text-2xl font-bold">{cityData.temperature}°C</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {cityData.conditions}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>Humidity: {cityData.humidity}%</p>
                        <p>Pressure: {cityData.pressure} hPa</p>
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>Wind: {cityData.windSpeed} m/s</p>
                        {cityData.alert && (
                          <p className="text-yellow-500">{cityData.alert}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default FavoritesPage;