import React, { useState, useEffect, useRef } from 'react';

interface City {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading?: boolean;
  isDarkMode: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCities = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
      );
      const data = await response.json();
      setSuggestions(data);
      setIsDropdownOpen(true);
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchCities(value);
  };

  const handleSuggestionClick = (city: City) => {
    const cityName = city.name;
    setSearchTerm(cityName);
    setIsDropdownOpen(false);
    onSearch(cityName);
  };

  return (
    <div className="w-full max-w-md relative" ref={dropdownRef}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.length >= 3 && setIsDropdownOpen(true)}
          placeholder="Search for a city..."
          className={`w-full px-4 py-2 pr-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
            ${isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          disabled={isLoading}
        />
        <div className={`absolute right-2 p-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-600'}`}>
          {isSearching ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isDropdownOpen && suggestions.length > 0 && (
        <div className={`absolute z-50 w-full mt-1 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
          {suggestions.map((city, index) => (
            <button
              key={`${city.name}-${city.lat}-${city.lon}`}
              onClick={() => handleSuggestionClick(city)}
              className={`w-full text-left px-4 py-2 ${isDarkMode ? 'hover:bg-gray-600 focus:bg-gray-600' : 'hover:bg-gray-100 focus:bg-gray-100'} focus:outline-none ${
                index !== suggestions.length - 1 ? `${isDarkMode ? 'border-b border-gray-600' : 'border-b border-gray-200'}` : ''
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{city.name}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-600'}`}>
                  {city.state ? `${city.state}, ` : ''}{city.country}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isDropdownOpen && searchTerm.length >= 3 && suggestions.length === 0 && !isSearching && (
          <div className={`absolute z-50 w-full mt-1 ${isDarkMode ? ' text-gray-100 bg-gray-700 border-gray-600' : 'text-gray-600 bg-white border-gray-300'} rounded-lg shadow-lg p-4 text-center`}>
          No cities found
        </div>
      )}
    </div>
  );
};

export default SearchBar; 