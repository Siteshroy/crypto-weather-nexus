import { configureStore } from '@reduxjs/toolkit';
import cryptoReducer from './features/cryptoSlice';
import weatherReducer from './features/weatherSlice';
import newsReducer from './features/newsSlice';
import notificationReducer from './features/notificationSlice';
import themeReducer from './features/themeSlice';
import { notificationMiddleware } from './middleware/notificationMiddleware';

export const store = configureStore({
  reducer: {
    crypto: cryptoReducer,
    weather: weatherReducer,
    news: newsReducer,
    notifications: notificationReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(notificationMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 