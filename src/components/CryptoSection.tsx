import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchCryptoData, toggleFavorite, addToDisplay, removeFromDisplay } from '../redux/features/cryptoSlice';
import Link from 'next/link';

// Base coins that are always displayed
const BASE_COINS = [
  'bitcoin', 'ethereum', 'dogecoin', 'ripple', 'cardano', 
  'solana', 'polkadot', 'binancecoin', 'litecoin', 'chainlink',
  'avalanche-2', 'tron', 'matic-network', 'uniswap', 'bitcoin-cash'
];

interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
}

interface CryptoSectionProps {
  isDarkMode: boolean;
}

const CryptoSection: React.FC<CryptoSectionProps> = ({ isDarkMode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error, favorites } = useSelector((state: RootState) => state.crypto);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CoinSearchResult[]>([]);
  const [displayedCoins, setDisplayedCoins] = useState<string[]>(BASE_COINS);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchCryptoData(displayedCoins));
    const interval = setInterval(() => {
      dispatch(fetchCryptoData(displayedCoins));
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch, displayedCoins]);

  // Debounced search function
  useEffect(() => {
    const searchCoins = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${searchQuery}`,
          {
            headers: {
              'x-cg-demo-api-key': process.env.NEXT_PUBLIC_COINGECKO_API_KEY as string
            }
          }
        );
        const data = await response.json();
        setSearchResults(data.coins.slice(0, 10)); // Limit to top 10 results
        setShowDropdown(true);
      } catch (error) {
        console.error('Error searching coins:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchCoins, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCoinSelect = (coinId: string) => {
    if (!displayedCoins.includes(coinId)) {
      dispatch(addToDisplay(coinId));
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemoveCoin = (e: React.MouseEvent, coinId: string) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    dispatch(removeFromDisplay(coinId));
  };

  const handleToggleFavorite = (e: React.MouseEvent, coinId: string) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    dispatch(toggleFavorite(coinId));
  };

  // Filter and sort coins based on favorites
  const sortedCoins = displayedCoins
    .sort((a, b) => {
      const aIsFavorite = favorites.includes(a);
      const bIsFavorite = favorites.includes(b);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return 0;
    });

  if (loading && Object.keys(data).length === 0) {
    return <div className="text-center">Loading crypto data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          Cryptocurrency
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              ${isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
          />
          {/* Search Results Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg overflow-hidden
              ${isDarkMode 
                ? 'bg-gray-700 border border-gray-600' 
                : 'bg-white border border-gray-200'
              }`}>
              {searchResults.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => handleCoinSelect(coin.id)}
                  className={`w-full text-left px-4 py-2 hover:bg-opacity-10 transition-colors duration-200
                    ${isDarkMode
                      ? 'text-gray-100 hover:bg-gray-600'
                      : 'text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center">
                    <span className="font-medium">{coin.name}</span>
                    <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ({coin.symbol})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedCoins.map((coinId) => {
          const coinData = data[coinId];
          if (!coinData) return null;

          return (
            <Link
              href={`/crypto/${coinId}`}
              key={coinData.id}
              className={`rounded-lg p-4 transition-colors duration-200
                ${isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-50 hover:bg-gray-100'
                }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {coinData.name}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {coinData.symbol.toUpperCase()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => handleToggleFavorite(e, coinData.id)}
                    className="text-yellow-500 hover:text-yellow-600 transition-colors"
                  >
                    {favorites.includes(coinData.id) ? (
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                  </button>
                  {!BASE_COINS.includes(coinData.id) && (
                    <button
                      onClick={(e) => handleRemoveCoin(e, coinData.id)}
                      className={`text-gray-500 hover:text-red-500 transition-colors`}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">${coinData.price.toLocaleString()}</p>
                <p className={`${coinData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {coinData.priceChange24h.toFixed(2)}% (24h)
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Market Cap: ${(coinData.marketCap / 1e9).toFixed(2)}B
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoSection;

