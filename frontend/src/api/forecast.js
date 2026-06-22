import axios from 'axios';

const client = axios.create({
  baseURL: '/',
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Fetch a weather forecast for the given address.
 *
 * @param {string} address - Full mailing address
 * @returns {Promise<import('./types').ForecastResponse>}
 * @throws {Error} with a user-readable `.message`
 */
export async function fetchForecast(address) {
  try {
    const { data } = await client.post('/forecast', { address });
    return data;
  } catch (err) {
    const serverMessage = err.response?.data?.error;
    throw new Error(
      serverMessage || 'Could not load a forecast right now. Please try again.'
    );
  }
}
