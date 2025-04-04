import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Link from 'next/link';

interface CryptoDetailData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  description?: string;
}

const CryptoDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { theme, systemTheme } = useTheme();
  const reduxDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [mounted, setMounted] = useState(false);
  const [cryptoData, setCryptoData] = useState<CryptoDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get the current theme
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDarkMode = mounted ? (currentTheme === 'dark' || reduxDarkMode) : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCryptoDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch market data with retry logic
        const fetchWithRetry = async (url: string, maxRetries = 3) => {
          for (let i = 0; i < maxRetries; i++) {
            try {
              const response = await fetch(url, {
                headers: {
                  'x-cg-demo-api-key': process.env.NEXT_PUBLIC_COINGECKO_API_KEY as string
                }
              });
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const data = await response.json();
              return data;
            } catch (err) {
              if (i === maxRetries - 1) throw err;
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // Exponential backoff
            }
          }
        };

        // Fetch market data
        const marketData = await fetchWithRetry(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}&order=market_cap_desc&sparkline=true`
        );

        // Fetch additional info including description
        const detailData = await fetchWithRetry(
          `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`
        );

        if (marketData && marketData.length > 0) {
          setCryptoData({
            ...marketData[0],
            description: detailData.description?.en
          });
          setRetryCount(0); // Reset retry count on success
        } else {
          throw new Error('No data available for this cryptocurrency');
        }
      } catch (err) {
        console.error('Error fetching crypto details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch cryptocurrency data');
        
        // Implement retry logic
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            fetchCryptoDetail();
          }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoDetail();
    
    // Set up polling for price updates
    const interval = setInterval(fetchCryptoDetail, 30000);
    return () => clearInterval(interval);
  }, [id, retryCount]);

  // Wait for theme to be available
  if (!mounted) return null;

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
            <div className="h-64 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
            <div className="h-96 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cryptoData) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'} p-8`}>
        <div className={`max-w-4xl mx-auto ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error || 'Failed to load cryptocurrency data'}</p>
          <div className="mt-4 space-x-4">
            <button
              onClick={() => {
                setRetryCount(0);
                setError(null);
                setLoading(true);
              }}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-100 text-gray-900'
              }`}
            >
              Retry
            </button>
            <Link
              href="/dashboard"
              className={`inline-block px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-100 text-gray-900'
              }`}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-900'
            }`}
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Header Section */}
        <div className={`rounded-xl p-8 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex items-center space-x-4 mb-6">
            <img src={cryptoData.image} alt={cryptoData.name} className="w-16 h-16" />
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {cryptoData.name} ({cryptoData.symbol.toUpperCase()})
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Rank #{cryptoData.market_cap_rank}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${cryptoData.current_price.toLocaleString()}
              </h2>
              <p className={`text-sm ${
                cryptoData.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {cryptoData.price_change_percentage_24h.toFixed(2)}% (24h)
              </p>
            </div>

            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Market Cap</p>
              <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${cryptoData.market_cap.toLocaleString()}
              </p>
            </div>

            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>24h Volume</p>
              <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${cryptoData.total_volume.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Price Statistics */}
        <div className={`rounded-xl p-8 mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Price Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>24h High</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${cryptoData.high_24h.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>24h Low</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${cryptoData.low_24h.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>All-Time High</p>
                  <div className="text-right">
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${cryptoData.ath.toLocaleString()}
                    </p>
                    <p className={`text-sm ${cryptoData.ath_change_percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {cryptoData.ath_change_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>All-Time Low</p>
                  <div className="text-right">
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${cryptoData.atl.toLocaleString()}
                    </p>
                    <p className={`text-sm ${cryptoData.atl_change_percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {cryptoData.atl_change_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Market Cap Change 24h</p>
                  <p className={`font-semibold ${
                    cryptoData.market_cap_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {cryptoData.market_cap_change_percentage_24h.toFixed(2)}%
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Circulating Supply</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cryptoData.circulating_supply.toLocaleString()} {cryptoData.symbol.toUpperCase()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Supply</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cryptoData.total_supply ? cryptoData.total_supply.toLocaleString() : 'N/A'} {cryptoData.symbol.toUpperCase()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max Supply</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cryptoData.max_supply ? cryptoData.max_supply.toLocaleString() : 'N/A'} {cryptoData.symbol.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {cryptoData.description && (
          <div className={`rounded-xl p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              About {cryptoData.name}
            </h2>
            <div 
              className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none`}
              dangerouslySetInnerHTML={{ __html: cryptoData.description }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoDetailPage; 