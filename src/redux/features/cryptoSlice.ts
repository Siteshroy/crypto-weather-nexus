import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addNotification } from './notificationSlice';

interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  last_updated: string;
}

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  lastUpdated: string;
}

interface CryptoState {
  data: Record<string, CryptoData>;
  favorites: string[];
  displayedCoins: string[];
  loading: boolean;
  error: string | null;
}

const initialState: CryptoState = {
  data: {},
  favorites: [],
  displayedCoins: ['bitcoin', 'ethereum', 'dogecoin', 'ripple', 'cardano'],
  loading: false,
  error: null,
};

export const fetchCryptoData = createAsyncThunk(
  'crypto/fetchData',
  async (coins: string[]) => {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coins.join(',')}&order=market_cap_desc&sparkline=false`,
      {
        headers: {
          'x-cg-demo-api-key': process.env.NEXT_PUBLIC_COINGECKO_API_KEY as string
        }
      }
    );
    return response.json();
  }
);

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const cryptoId = action.payload;
      const cryptoData = state.data[cryptoId];
      if (!cryptoData) return;

      if (state.favorites.includes(cryptoId)) {
        state.favorites = state.favorites.filter(id => id !== cryptoId);
        // Dispatch remove from favorites notification using thunk
        addNotification({
          title: '⭐ Removed from Favorites',
          message: `${cryptoData.name} has been removed from your favorites`,
          type: 'info'
        });
      } else {
        state.favorites.push(cryptoId);
        // Dispatch add to favorites notification using thunk
        addNotification({
          title: '⭐ Added to Favorites',
          message: `${cryptoData.name} has been added to your favorites`,
          type: 'success'
        });
      }
    },
    addToDisplay: (state, action) => {
      const cryptoId = action.payload;
      if (!state.displayedCoins.includes(cryptoId)) {
        state.displayedCoins.push(cryptoId);
        const cryptoData = state.data[cryptoId];
        if (cryptoData) {
          // Dispatch add to display notification using thunk
          addNotification({
            title: '👁️ Added to Display',
            message: `${cryptoData.name} has been added to your dashboard`,
            type: 'info'
          });
        }
      }
    },
    removeFromDisplay: (state, action) => {
      const cryptoId = action.payload;
      const cryptoData = state.data[cryptoId];
      if (cryptoData) {
        state.displayedCoins = state.displayedCoins.filter(id => id !== cryptoId);
        // Dispatch remove from display notification using thunk
        addNotification({
          title: '👁️ Removed from Display',
          message: `${cryptoData.name} has been removed from your dashboard`,
          type: 'info'
        });
      }
    },
    updatePrice: (state, action) => {
      const { id, price } = action.payload;
      if (state.data[id]) {
        state.data[id].price = price;
        state.data[id].lastUpdated = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCryptoData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCryptoData.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((crypto: CoinGeckoResponse) => {
          state.data[crypto.id] = {
            id: crypto.id,
            symbol: crypto.symbol,
            name: crypto.name,
            price: crypto.current_price,
            priceChange24h: crypto.price_change_percentage_24h,
            marketCap: crypto.market_cap,
            lastUpdated: crypto.last_updated,
          };
        });
      })
      .addCase(fetchCryptoData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch crypto data';
        // Dispatch error notification
        addNotification({
          title: '❌ Data Fetch Error',
          message: 'Failed to fetch cryptocurrency data. Please try again later.',
          type: 'error'
        });
      });
  },
});

export const { toggleFavorite, addToDisplay, removeFromDisplay, updatePrice } = cryptoSlice.actions;
export default cryptoSlice.reducer; 