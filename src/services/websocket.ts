import { store } from '../redux/store';
import { addNotification } from '../redux/features/notificationSlice';

type NotificationType = 'success' | 'warning' | 'error' | 'info' | 'price_alert' | 'weather_alert';

interface WebSocketNotification {
  type: NotificationType;
  title: string;
  message: string;
}

interface PriceUpdate {
  type: 'price_update';
  symbol: string;
  price: number;
  percentChange: number;
}

type WebSocketMessage = WebSocketNotification | PriceUpdate;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket('wss://your-websocket-server.com');
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      store.dispatch(
        addNotification({
          type: 'success',
          title: 'Connection Established',
          message: 'Successfully connected to real-time updates',
        })
      );
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      store.dispatch(
        addNotification({
          type: 'warning',
          title: 'Connection Lost',
          message: 'Lost connection to real-time updates. Attempting to reconnect...',
        })
      );
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      store.dispatch(
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Error in real-time connection. Attempting to reconnect...',
        })
      );
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  private handleMessage(data: WebSocketMessage): void {
    if (data.type === 'price_update') {
      const { symbol, price, percentChange } = data;
      if (Math.abs(percentChange) >= 2) {
        store.dispatch(
          addNotification({
            type: 'price_alert',
            title: `${symbol.toUpperCase()} Price Alert`,
            message: `${symbol.toUpperCase()} has ${percentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(2)}%`,
          })
        );
      }
    } else {
      // Handle notification message
      store.dispatch(
        addNotification({
          type: data.type,
          title: data.title,
          message: data.message
        })
      );
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      store.dispatch(
        addNotification({
          type: 'error',
          title: 'Connection Failed',
          message: 'Failed to establish connection after multiple attempts. Please try again later.',
        })
      );
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

export const websocketService = new WebSocketService(); 