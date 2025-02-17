'use client';

import React, { useState, useMemo } from 'react';
import countriesData from 'world-countries';

export default function SearchHelpPage() {
  const [search, setSearch] = useState('');

  // Build an array of { code, name } for each country
  const allCountries = useMemo(() => {
    return countriesData
      .map((c) => ({
        code: c.cca2.toUpperCase(),
        name: c.name.common,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Filter the array based on `search` input
  const filteredCountries = useMemo(() => {
    if (!search) return allCountries;
    return allCountries.filter(
      (country) =>
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, allCountries]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-4 text-center">
          <span role="img" aria-label="magnifying-glass">
            🔎
          </span>{' '}
          Search Help - All Country Codes
        </h1>
        <p className="text-md text-gray-700 mb-6 text-center">
          This page lists <strong>all known 2-letter country codes</strong> from the <code>world-countries</code> library. 
          <br />You can quickly filter by name (<em>e.g., Spain</em>) or code (<em>e.g., ES</em>) below.
        </p>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Type a country name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          {filteredCountries.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredCountries.map((country) => (
                <li key={country.code} className="py-2 flex justify-between">
                  <span>{country.name}</span>
                  <span className="font-mono text-gray-600">{country.code}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No matching countries found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
