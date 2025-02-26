"use client";

import React, { useState, useMemo } from "react";
import countriesData from "world-countries";

interface CountryItem {
  code: string;
  name: string;
}

export default function SearchHelpPage() {
  const [search, setSearch] = useState("");

  // Build an array of { code, name } for each country
  const allCountries = useMemo<CountryItem[]>(() => {
    return countriesData
      .map((c) => ({
        code: c.cca2.toUpperCase(),
        name: c.name.common,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Filter the array based on the search input
  const filteredCountries = useMemo(() => {
    if (!search) return allCountries;
    const lower = search.toLowerCase();
    return allCountries.filter(
      (country) =>
        country.name.toLowerCase().includes(lower) ||
        country.code.toLowerCase().includes(lower)
    );
  }, [search, allCountries]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-2 text-center">
          <span role="img" aria-label="magnifying-glass">
            🔎
          </span>{" "}
          Search Help - All Country Codes
        </h1>
        <p className="text-md text-gray-700 mb-4 text-center">
          This page lists all known 2-letter country codes from the{" "}
          <code>world-countries</code> library.
        </p>
        <p className="text-sm text-gray-600 mb-6 text-center">
          You can filter by name (e.g., Spain) or code (e.g., ES).<br />
          To view the current time for a country, append <code>now</code> to the URL, e.g. <code>/TRnow</code>.
        </p>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Type a country name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
            <p className="text-gray-500 p-3">No matching countries found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
