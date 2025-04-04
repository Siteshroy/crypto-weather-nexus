import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string | null;
  source_name: string;
  date: string;
}

interface NewsState {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface NewsDataArticle {
  article_id: string;
  title: string;
  description: string;
  link: string;
  image_url: string | null;
  source_name: string;
  pubDate: string;
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const initialState: NewsState = {
  articles: [],
  loading: false,
  error: null,
  lastFetched: null
};

// Helper function to get cached news
const getCachedNews = (): { articles: NewsArticle[], timestamp: number } | null => {
  if (typeof window === 'undefined') return null;
  
  const cached = localStorage.getItem('cachedNews');
  if (!cached) return null;

  try {
    const { articles, timestamp } = JSON.parse(cached);
    return { articles, timestamp };
  } catch {
    return null;
  }
};

// Helper function to set cached news
const setCachedNews = (articles: NewsArticle[]) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('cachedNews', JSON.stringify({
    articles,
    timestamp: Date.now()
  }));
};

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (_, { rejectWithValue }) => {
    try {
      // Check cache first
      const cached = getCachedNews();
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { results: cached.articles.map(article => ({
          article_id: article.id,
          title: article.title,
          description: article.description,
          link: article.url,
          image_url: article.image_url,
          source_name: article.source_name,
          pubDate: article.date
        })) };
      }

      const apiKey = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY;
      if (!apiKey) {
        throw new Error('NewsData API key is not configured');
      }

      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${apiKey}&q=cryptocurrency&language=en`
      );

      if (!response.ok) {
        // If we get rate limited but have cached data, use it even if expired
        if (response.status === 429 && cached) {
          console.log('Rate limited, using expired cache');
          return { results: cached.articles.map(article => ({
            article_id: article.id,
            title: article.title,
            description: article.description,
            link: article.url,
            image_url: article.image_url,
            source_name: article.source_name,
            pubDate: article.date
          })) };
        }

        const errorData = await response.json().catch(() => null);
        console.error('News API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid API response format');
      }

      return data;
    } catch (error) {
      console.error('News fetch error:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch news');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload as NewsDataResponse;
        try {
          state.articles = response.results.slice(0, 5).map((article) => ({
            id: article.article_id,
            title: article.title || 'No title',
            description: article.description || 'No description available',
            url: article.link,
            image_url: article.image_url,
            source_name: article.source_name || 'Unknown source',
            date: article.pubDate,
          }));
          state.error = null;
          state.lastFetched = Date.now();
          // Cache the successful response
          setCachedNews(state.articles);
        } catch (error) {
          console.error('Error processing news data:', error);
          state.error = 'Error processing news data';
          state.articles = [];
        }
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch news';
        state.articles = [];
      });
  },
});

export default newsSlice.reducer; 