import { useState, useEffect } from 'react';
import api from '../services/api';
import headerLogo from '../assets/zeo-logo.png';
import footerLogo from '../assets/zeo-logo-white.png';

interface LogoData {
  header: string;
  footer: string;
  lastUpdated: string;
}

export const useLogos = () => {
  const [logos, setLogos] = useState<LogoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.logos.getAll();
      setLogos(data);
    } catch (err) {
      console.error('Error fetching logos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logos');
      // Set default logos on error - this ensures the site always works
      setLogos({
        header: headerLogo,
        footer: footerLogo,
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  const refetch = async () => {
    await fetchLogos();
  };

  return { logos, loading, error, refetch };
};

export default useLogos;