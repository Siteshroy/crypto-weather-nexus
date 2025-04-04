import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

// Dynamically import components that need localStorage
const DashboardContent = dynamic(() => import('../components/DashboardContent'), {
  ssr: false,
});

export default function Dashboard() {
  const isDarkMode = useSelector((state: RootState) => state.theme?.isDarkMode ?? false);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <DashboardContent />
    </div>
  );
}