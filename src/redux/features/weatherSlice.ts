import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
  history: WeatherHistory[];
}

interface WeatherHistory {
  timestamp: number;
  temperature: number;
  humidity: number;
}

interface WeatherState {
  data: Record<string, WeatherData>;
  favorites: string[];
  loading: boolean;
  error: string | null;
}

const initialState: WeatherState = {
  data: {},
  favorites: [],
  loading: false,
  error: null,
};

export const fetchWeatherData = createAsyncThunk(
  'weather/fetchData',
  async (cities: string[]) => {
    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!API_KEY) {
      throw new Error('OpenWeather API key is not configured');
    }

    const promises = cities.map(async (city) => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
        console.log('Fetching weather for:', city, 'URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error response for ${city}:`, errorData);
          throw new Error(`Failed to fetch weather for ${city}: ${errorData.message}`);
        }
        
        const data = await response.json();
        
        // Fetch additional location details using coordinates
        const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${data.coord.lat}&lon=${data.coord.lon}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();
        
        return {
          ...data,
          state: geoData[0]?.state,
          country: geoData[0]?.country
        };
      } catch (error) {
        console.error(`Error fetching weather for ${city}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const validResults = results.filter(result => result !== null);
    
    if (validResults.length === 0) {
      throw new Error('Failed to fetch weather data for all cities');
    }
    
    return validResults;
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const cityId = action.payload;
      if (state.favorites.includes(cityId)) {
        state.favorites = state.favorites.filter(id => id !== cityId);
      } else {
        state.favorites.push(cityId);
      }
    },
    updateWeatherAlert: (state, action) => {
      const { cityId, alert } = action.payload;
      if (state.data[cityId]) {
        state.data[cityId] = {
          ...state.data[cityId],
          alert,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((weather) => {
          if (weather && weather.id) {
            const cityId = weather.id.toString();
            state.data[cityId] = {
              id: cityId,
              city: weather.name,
              state: weather.state,
              country: weather.country,
              temperature: weather.main.temp,
              humidity: weather.main.humidity,
              pressure: weather.main.pressure,
              windSpeed: weather.wind.speed,
              conditions: weather.weather[0].main,
              history: [],
            };
          }
        });
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch weather data';
      });
  },
});

export const { toggleFavorite, updateWeatherAlert } = weatherSlice.actions;
export default weatherSlice.reducer; 