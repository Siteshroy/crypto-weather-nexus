export interface User {
  _id?: string;
  username: string;
  email: string;
  password: string;
  favorites?: string[];
  displayedCoins?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserResponse {
  userId: string;
  username: string;
  email: string;
  token: string;
  favorites?: string[];
  displayedCoins?: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email?: string;
  password: string;
  confirmPassword?: string;
} 