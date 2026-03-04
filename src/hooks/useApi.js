import { useState, useCallback } from 'react';
import apiClient from '../config/api';

/**
 * Custom hook for making API calls with loading and error states
 * @returns {Object} API call utilities
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Make an API request
   * @param {Function} apiFunction - The API function to call
   * @param {*} params - Parameters to pass to the API function
   * @returns {Promise} API response or error
   */
  const request = useCallback(async (apiFunction, ...params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction(...params);
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    request,
    clearError,
  };
};

/**
 * Custom hook for fetching data with loading, error, and data states
 * @param {Function} apiFunction - The API function to call
 * @param {*} dependencies - Dependencies to trigger re-fetch
 * @returns {Object} Data, loading, error, and refetch function
 */
export const useFetch = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (...params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction(...params);
      setData(response.data);
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useApi;
