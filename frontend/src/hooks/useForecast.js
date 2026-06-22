import { useState, useCallback } from 'react';
import { fetchForecast } from '../api/forecast';

const IDLE    = 'idle';
const LOADING = 'loading';
const SUCCESS = 'success';
const ERROR   = 'error';

/**
 * Encapsulates all forecast-fetching state so the page component stays
 * concerned only with layout and user interaction.
 *
 * @returns {{
 *   status: 'idle'|'loading'|'success'|'error',
 *   forecast: object|null,
 *   error: string,
 *   lookup: (address: string) => Promise<void>,
 *   reset: () => void,
 * }}
 */
export function useForecast() {
  const [status,   setStatus]   = useState(IDLE);
  const [forecast, setForecast] = useState(null);
  const [error,    setError]    = useState('');

  const lookup = useCallback(async (address) => {
    setStatus(LOADING);
    setError('');

    try {
      const data = await fetchForecast(address);
      setForecast(data);
      setStatus(SUCCESS);
    } catch (err) {
      setForecast(null);
      setError(err.message);
      setStatus(ERROR);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus(IDLE);
    setForecast(null);
    setError('');
  }, []);

  return {
    status,
    forecast,
    error,
    isLoading: status === LOADING,
    lookup,
    reset,
  };
}
