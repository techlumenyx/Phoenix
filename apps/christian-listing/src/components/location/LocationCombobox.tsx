import { gql, useQuery } from '@apollo/client';
import { useEffect, useId, useRef, useState } from 'react';

const LOCATION_SUGGESTIONS = gql`
  query LocationSuggestions($query: String!, $countryCode: String, $limit: Int) {
    locationSuggestions(query: $query, countryCode: $countryCode, limit: $limit) {
      id
      name
      displayName
      countryCode
      countryName
      admin1Name
    }
  }
`;

export interface CanonicalLocation {
  id: string;
  name: string;
  displayName: string;
  countryCode: string;
  countryName: string;
  admin1Name?: string | null;
}

interface LocationComboboxProps {
  value?: CanonicalLocation | null;
  initialLabel?: string;
  onChange: (location: CanonicalLocation) => void;
  placeholder?: string;
  countryCode?: string;
  autoFocus?: boolean;
  className?: string;
}

export default function LocationCombobox({
  value,
  initialLabel = '',
  onChange,
  placeholder = 'Search for a city',
  countryCode,
  autoFocus,
  className = '',
}: LocationComboboxProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState(value?.displayName ?? initialLabel);
  const [debouncedInput, setDebouncedInput] = useState(input);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedInput(input.trim()), 220);
    return () => window.clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    if (value) setInput(value.displayName);
  }, [value]);

  useEffect(() => {
    if (!value) setInput(initialLabel);
  }, [initialLabel, value]);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const { data, loading } = useQuery<{ locationSuggestions: CanonicalLocation[] }>(LOCATION_SUGGESTIONS, {
    variables: { query: debouncedInput, countryCode: countryCode || null, limit: 10 },
    skip: debouncedInput.length === 1,
    fetchPolicy: 'cache-first',
  });
  const suggestions = data?.locationSuggestions ?? [];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={input}
        autoFocus={autoFocus}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setInput(event.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1B1B1B] outline-none placeholder:text-gray-400 focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/25"
      />

      {open && (
        <div id={listboxId} role="listbox" className="absolute z-[70] mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl">
          {loading && <p className="px-3 py-3 text-xs text-gray-500">Finding locations…</p>}
          {!loading && suggestions.map((location) => (
            <button
              key={location.id}
              type="button"
              role="option"
              aria-selected={value?.id === location.id}
              onClick={() => {
                setInput(location.displayName);
                setOpen(false);
                onChange(location);
              }}
              className="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-[#F5F0EB]"
            >
              <span className="block text-sm font-semibold text-[#1B1B1B]">{location.name}</span>
              <span className="block truncate text-xs text-gray-500">{location.displayName}</span>
            </button>
          ))}
          {!loading && debouncedInput.length >= 2 && suggestions.length === 0 && (
            <p className="px-3 py-3 text-xs text-gray-500">No matching city found. Check the spelling and try again.</p>
          )}
          {!loading && debouncedInput.length === 1 && (
            <p className="px-3 py-3 text-xs text-gray-500">Enter at least two characters.</p>
          )}
          <p className="border-t border-gray-100 px-3 py-2 text-[10px] text-gray-400">Location data © GeoNames</p>
        </div>
      )}
    </div>
  );
}
