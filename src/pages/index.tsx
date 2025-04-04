import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthPage from '../components/AuthPage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      if (userId) {
        router.push('/dashboard');
      }
    }
  }, [router]);

  return <AuthPage />;
} 