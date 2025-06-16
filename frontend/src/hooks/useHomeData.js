// Custom hook để quản lý dữ liệu home page
import { useState, useEffect, useCallback } from 'react';
import { homeService } from '../services';

export const useHomeData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const homeData = await homeService.getHomePageData();
      setData(homeData);
    } catch (err) {
      setError(err.message || 'Failed to load home data');
      console.error('Home data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const refreshData = async () => {
    await fetchHomeData();
  };

  return { data, loading, error, refreshData };
};

export default useHomeData;
