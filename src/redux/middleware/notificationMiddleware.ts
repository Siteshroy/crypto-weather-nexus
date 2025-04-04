import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { addNotification } from '../features/notificationSlice';
import { RootState } from '../store';

interface CryptoAction extends AnyAction {
  payload: {
    name: string;
    isFavorite?: boolean;
  };
}

export const notificationMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (typeof action === 'object' && action !== null && 'type' in action) {
    const cryptoAction = action as CryptoAction;
    
    switch (cryptoAction.type) {
      case 'crypto/toggleFavorite':
        store.dispatch(
          addNotification({
            type: 'success',
            title: cryptoAction.payload.isFavorite ? 'Added to Favorites' : 'Removed from Favorites',
            message: `${cryptoAction.payload.name} has been ${cryptoAction.payload.isFavorite ? 'added to' : 'removed from'} favorites`,
          })
        );
        break;

      case 'crypto/addToDisplay':
        store.dispatch(
          addNotification({
            type: 'info',
            title: 'Added to Display',
            message: `${cryptoAction.payload.name} has been added to the display`,
          })
        );
        break;

      case 'crypto/removeFromDisplay':
        store.dispatch(
          addNotification({
            type: 'info',
            title: 'Removed from Display',
            message: `${cryptoAction.payload.name} has been removed from the display`,
          })
        );
        break;

      case 'crypto/fetchData/rejected':
        store.dispatch(
          addNotification({
            type: 'error',
            title: 'Error Fetching Data',
            message: 'Failed to fetch cryptocurrency data. Please try again later.',
          })
        );
        break;
    }
  }

  return result;
}; 