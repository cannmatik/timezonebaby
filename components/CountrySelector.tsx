'use client';

import React, { useState, useMemo } from 'react';
import countriesData from 'world-countries';
import moment from 'moment-timezone';
import flags from 'emoji-flags';

export interface Country {
  name: string;
  timezone: string;
  flag: string;
  code: string;
}

export interface CountrySelectorProps {
  onSelectCountry: (country: Country) => void;
}

const getFlagEmoji = (countryCode: string) => {
  return flags.countryCode(countryCode)?.emoji || '🏳';
};

const useGroupedCountries = () => {
  return useMemo(() => {
    const grouped: Record<string, Country[]> = {};

    // Debug: Log countriesData to verify it's loaded correctly
    console.log('countriesData:', countriesData);

    // Ensure countriesData is an array
    if (!Array.isArray(countriesData)) {
      console.error('countriesData is not an array:', countriesData);
      return [];
    }

    countriesData.forEach((country) => {
      const region = country.region || 'Other';
      if (!grouped[region]) grouped[region] = [];

      const code = country.cca2;
      const timezones = moment.tz.zonesForCountry(code);

      // Emniyetli şekilde kontrol yapıyoruz
      const primaryTimezone =
        timezones && timezones.length > 0 ? timezones[0] : 'UTC';

      grouped[region].push({
        name: country.name.common,
        timezone: primaryTimezone,
        flag: getFlagEmoji(code),
        code: code.toLowerCase(),
      });
    });

    return Object.keys(grouped)
      .sort()
      .map((continent) => ({
        continent,
        countries: grouped[continent].sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      }));
  }, []);
};

const CountrySelector: React.FC<CountrySelectorProps> = ({ onSelectCountry }) => {
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const groupedCountries = useGroupedCountries();

  const toggleGroup = (continent: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(continent)) {
        newSet.delete(continent);
      } else {
        newSet.add(continent);
      }
      return newSet;
    });
  };

  const allCountries = useMemo(
    () => groupedCountries.flatMap((g) => g.countries),
    [groupedCountries]
  );

  const filteredCountries = useMemo(
    () =>
      search
        ? allCountries.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase())
          )
        : null,
    [search, allCountries]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Select a Country</h2>
      <input
        type="text"
        placeholder="Search country..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg shadow focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* Eğer arama yapılıyorsa (search doluysa) sonuçlar listelenir, değilse kıtalar listelenir */}
      {filteredCountries ? (
        <div className="space-y-2">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country, index) => (
              <div
                key={index}
                onClick={() => onSelectCountry(country)}
                className="cursor-pointer flex items-center gap-3 p-3 bg-white rounded-lg shadow hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl">{country.flag}</span>
                <span className="text-gray-800 font-medium">{country.name}</span>
                <span className="text-sm text-gray-500 ml-auto">
                  {country.timezone}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-600 p-3">No matching countries found.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {groupedCountries.map((group) => (
            <div key={group.continent} className="bg-gray-50 rounded-lg shadow">
              <div
                onClick={() => toggleGroup(group.continent)}
                className="p-3 font-bold bg-gray-200 rounded-t-lg cursor-pointer flex justify-between items-center hover:bg-gray-300"
              >
                <span>{group.continent}</span>
                <span className="text-sm">({group.countries.length})</span>
              </div>
              {expandedGroups.has(group.continent) && (
                <div className="p-3 space-y-2">
                  {group.countries.map((country) => (
                    <div
                      key={country.code}
                      onClick={() => onSelectCountry(country)}
                      className="cursor-pointer flex items-center gap-3 p-2 bg-white hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <span className="text-gray-800">{country.name}</span>
                      <span className="text-sm text-gray-500 ml-auto">
                        {country.timezone}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
