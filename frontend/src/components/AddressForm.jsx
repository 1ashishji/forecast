import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { validateAddress } from '../utils/validateAddress';

/**
 * Controlled address search form.
 *
 * @param {{ onSubmit: (address: string) => void, isLoading: boolean }} props
 */
export function AddressForm({ onSubmit, isLoading }) {
  const [address,    setAddress]    = useState('');
  const [fieldError, setFieldError] = useState('');

  function handleChange(event) {
    const next = event.target.value;
    setAddress(next);
    // Live-clear error as user corrects input, but only after first submission.
    if (fieldError) setFieldError(validateAddress(next));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const error = validateAddress(address);
    setFieldError(error);
    if (error) return;
    onSubmit(address.trim());
  }

  return (
    <form className="forecast-form card" onSubmit={handleSubmit} noValidate>
      <label className="field-label" htmlFor="address">
        Street Address
      </label>

      <div className={`input-shell${fieldError ? ' has-error' : ''}`}>
        <MapPin size={18} />
        <input
          id="address"
          name="address"
          placeholder="1 Apple Park Way, Cupertino, CA"
          value={address}
          onChange={handleChange}
          autoComplete="street-address"
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? 'address-error' : 'address-hint'}
        />
      </div>

      {fieldError ? (
        <p className="field-error" id="address-error" role="alert">
          {fieldError}
        </p>
      ) : (
        <p className="field-help" id="address-hint">
          Use the full format: 123 Street, City, ST — so the backend can resolve
          a ZIP code reliably.
        </p>
      )}

      <button
        className="btn btn-primary forecast-submit"
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        <Search size={18} />
        {isLoading ? 'Checking forecast…' : 'Get Forecast'}
      </button>
    </form>
  );
}
