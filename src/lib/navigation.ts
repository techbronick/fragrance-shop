import { useRouter, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';

// Helper hooks to mimic React Router behavior
export const useNavigate = () => {
  const router = useRouter();
  return (path: string) => router.push(path);
};

export const useParams = () => {
  return useNextParams();
};

export const useSearchParams = () => {
  const searchParams = useNextSearchParams();
  return new URLSearchParams(searchParams?.toString() || '');
};

export const useLocation = () => {
  const router = useRouter();
  // For compatibility with React Router useLocation
  return {
    pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    search: typeof window !== 'undefined' ? window.location.search : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
  };
}; 