import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchWeatherData, toggleFavorite } from '../redux/features/weatherSlice';
import LoadingSpinner from './LoadingSpinner';
import SearchBar from './SearchBar';
import WeatherDetailModal from './WeatherDetailModal';

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

interface WeatherCardProps {
  cityData: WeatherData;
  isFavorite: boolean;
  isDarkMode: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onClick: () => void;
}

interface WeatherSectionProps {
  isDarkMode: boolean;
}

const WeatherSection: React.FC<WeatherSectionProps> = ({ isDarkMode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error, favorites } = useSelector((state: RootState) => state.weather);
  const [cities, setCities] = useState<string[]>(['New York', 'London', 'Tokyo']);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchWeatherData(cities)).unwrap();
      } catch (error) {
        console.error('Error in weather fetch:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval);
  }, [dispatch, cities]);

  const handleSearch = async (city: string) => {
    setSearchError(null);
    try {
      const result = await dispatch(fetchWeatherData([city])).unwrap();
      if (result && result.length > 0) {
        if (!cities.includes(city)) {
          setCities(prev => [...prev, city]);
        }
      }
    } catch (error) {
      setSearchError(`Could not find weather data for "${city}"`);
      console.error('Search error:', error);
    }
  };

  const handleRemoveCity = (cityToRemove: string) => {
    setCities(prev => prev.filter(city => city !== cityToRemove));
  };

  const handleCardClick = (cityId: string) => {
    setSelectedCity(cityId);
  };

  const sortedCities = cities.sort((a, b) => {
    const cityDataA = Object.values(data).find(w => w?.city.toLowerCase() === a.toLowerCase());
    const cityDataB = Object.values(data).find(w => w?.city.toLowerCase() === b.toLowerCase());
    
    // If either city data is not found, keep original order
    if (!cityDataA || !cityDataB) return 0;
    
    // Sort by favorite status (favorites first)
    const isFavoriteA = favorites.includes(cityDataA.id);
    const isFavoriteB = favorites.includes(cityDataB.id);
    
    if (isFavoriteA && !isFavoriteB) return -1;
    if (!isFavoriteA && isFavoriteB) return 1;
    return 0;
  });

  if (loading && Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Weather</h2>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className={`text-2xl font-bold ${isDarkMode? 'text-white-800':'text-gray-800'}`}>Weather</h2>
        <SearchBar onSearch={handleSearch} isLoading={loading} isDarkMode={isDarkMode} />
      </div>

      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {searchError}
        </div>
      )}

      {error && (
        <div className={`text-red-500 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} text-center p-4 rounded-lg`}>
          <p className="font-semibold">Error loading weather data:</p>
          <p className="mt-2">{error}</p>
          <button 
            onClick={() => dispatch(fetchWeatherData(cities))}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCities.map((city) => {
          const cityData = Object.values(data).find(w => w?.city.toLowerCase() === city.toLowerCase());
          if (!cityData) return null;

          return (
            <div key={cityData.id} className="group relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCity(city);
                }}
                className="absolute -top-2 -right-2 z-10 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Remove city"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button  >
              <WeatherCard 
                cityData={cityData}
                isFavorite={favorites.includes(cityData.id)}
                onToggleFavorite={(e) => {
                  e.stopPropagation();
                  dispatch(toggleFavorite(cityData.id));
                } }
                onClick={() => handleCardClick(cityData.id)} isDarkMode={isDarkMode}              />
            </div>
          );
        })}
      </div>

      {selectedCity && (
        <WeatherDetailModal 
          cityData={data[selectedCity]}
          onClose={() => setSelectedCity(null)}
          isFavorite={favorites.includes(selectedCity)}
          onToggleFavorite={() => dispatch(toggleFavorite(selectedCity))}
          isDarkMode={isDarkMode}
        />
      )}

      {cities.length === 0 && (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No cities added. Use the search bar to add cities.</p>
        </div>
      )}
    </div>
  );
};

const WeatherCard: React.FC<WeatherCardProps> = ({ cityData, isFavorite, onToggleFavorite, onClick, isDarkMode }) => {
  return (
    <div 
      className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="relative">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              <span className="hover:text-blue-600 cursor-help peer">
                {cityData.city}
              </span>
              <div className={`absolute left-0 top-full mt-1 w-48 p-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} text-sm rounded-lg opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-200 z-10`}>
                <p>{cityData.city}</p>
                {cityData.state && <p>{cityData.state}</p>}
                <p>{cityData.country}</p>
              </div>
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            className="text-yellow-500 hover:text-yellow-600 transition-colors duration-200 focus:outline-none"
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
        </div>
        <div className="mt-4">
          <div className="flex items-baseline">
            <p className="text-4xl font-bold ">{Math.round(cityData.temperature)}°C</p>
            <p className={`ml-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-600'}`}>{cityData.conditions}</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className={`flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-600'}`}>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Humidity: {cityData.humidity}%</span>
            </div>
          </div>
        </div>
        {cityData.alert && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{cityData.alert}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherSection; 