import './i18n';
import './index.css';
import { ViteReactSSG } from 'vite-react-ssg';
import { routes } from '@/lib/routes';
import { imagePreloader } from '@/utils/imagePreloader';

if (typeof window !== 'undefined') {
  imagePreloader.preloadCriticalImages();
}

export const createRoot = ViteReactSSG(
  // react-router-dom data routes
  { routes },
);
