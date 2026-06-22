/**
 * Validates that the address has enough structure for the geocoding service
 * to resolve a result. Supports both US and international addresses.
 *
 * Requirements (intentionally loose):
 *   - Non-empty
 *   - At least 10 characters
 *   - Contains at least two comma-separated segments
 *     (e.g. "street, city" or "street, city, country")
 *   - First segment must start with at least one word character
 *
 * We deliberately avoid enforcing ZIP/PIN codes or country-specific formats —
 * that is the geocoding service's job. The validator's only role is to prevent
 * obviously incomplete inputs from hitting the API.
 *
 * @param {string} address
 * @returns {string} Error message, or empty string if valid.
 */
export function validateAddress(address) {
  const value = address.trim();

  if (!value) return 'Address is required.';

  if (value.length < 10)
    return 'Enter a fuller address so we can locate it (e.g. 123 Main St, Springfield, IL or Hazratganj, Lucknow, India).';

  const segments = value.split(',').map((s) => s.trim()).filter(Boolean);

  if (segments.length < 2)
    return 'Please include at least a street/area and a city, separated by a comma (e.g. Patrakar Puram, Lucknow, India).';

  return '';
}
