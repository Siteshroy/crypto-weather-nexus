import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../../services/authService';
import { LoginCredentials } from '../../models/User';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../redux/features/notificationSlice';

interface LoginFormProps {
  isDarkMode: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ isDarkMode }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.login(credentials);
      dispatch(addNotification({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back!',
      }));
      router.push('/dashboard');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error instanceof Error ? error.message : 'An error occurred during login',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto mt-8 p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className={`block mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className={`block mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-semibold transition-colors`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm; 