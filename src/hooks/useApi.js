import { useState, useCallback, useEffect, useRef } from 'react';
import axiosClient from '../services/axiosClient';

/**
 * Unified Custom Hook to make backend API calls.
 * @param {Object} options
 * @param {string} options.url - API endpoint
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {boolean} options.immediate - Whether to run immediately on component mount
 */
export const useApi = ({ url = '', method = 'GET', immediate = false } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (customConfig = {}) => {
    // Abort active duplicate request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Set up new AbortController
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    const requestConfig = {
      url: customConfig.url || url,
      method: customConfig.method || method,
      signal: abortControllerRef.current.signal,
      ...customConfig,
    };

    try {
      const responseData = await axiosClient(requestConfig);
      setData(responseData);
      return { data: responseData, error: null };
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return { data: null, error: 'canceled' };
      }
      const errorMessage = err.message || err.response?.data?.message || 'Đã xảy ra lỗi kết nối BE!';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [url, method]);

  useEffect(() => {
    if (immediate && url) {
      execute();
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute, immediate, url]);

  return { data, loading, error, execute, setData };
};
export default useApi;
