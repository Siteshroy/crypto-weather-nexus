import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchNews } from '../redux/features/newsSlice';
import { AppDispatch } from '../redux/store';

interface NewsSectionProps {
  isDarkMode: boolean;
}

export default function NewsSection({ isDarkMode }: NewsSectionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { articles, loading, error } = useSelector((state: RootState) => state.news);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        await dispatch(fetchNews()).unwrap();
      } catch (error) {
        console.error('Error fetching news:', error);
        // Retry up to 3 times with increasing delays
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        }
      }
    };

    fetchNewsData();
  }, [dispatch, retryCount]);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Crypto News
        </h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Crypto News
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 mb-2">Error loading news: {error}</p>
          {retryCount < 3 && (
            <button
              onClick={() => setRetryCount(prev => prev + 1)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Retry loading news
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="p-6">
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Crypto News
        </h2>
        <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No news articles available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Crypto News
      </h2>
      <div className="space-y-4">
        {articles.map((article) => (
          <div key={article.id} className="group">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <h3 className={`font-semibold group-hover:text-blue-500 transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {article.title}
              </h3>
              <p className={`text-sm mt-1 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {article.description}
              </p>
              <div className={`text-xs mt-2 flex justify-between items-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                <span>{article.source_name}</span>
                <span>{new Date(article.date).toLocaleDateString()}</span>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
} 