'use client';

import React, { useState } from 'react';
import { use } from 'react';
import { DateTime } from 'luxon';

// Third-party packages
import countriesData from 'world-countries';
import moment from 'moment-timezone';
import flags from 'emoji-flags';

// Next.js <Link> for internal navigation
import Link from 'next/link';

// Your custom CountrySelector component
import CountrySelector, { Country } from '@/components/CountrySelector';

// Example country codes to display if user input is invalid
const EXAMPLE_COUNTRY_CODES = ['TR', 'US', 'NL', 'FR', 'DE', 'GB', 'IT', 'ES'];

interface TimezonePageProps {
  // In Next.js 13 with the App Router, "params" can be a Promise<{ input: string }>
  params: Promise<{ input: string }>;
}

/** Returns a flag emoji (or fallback) for a given country code */
function getFlagEmoji(countryCode: string) {
  return flags.countryCode(countryCode)?.emoji || '🏳';
}

/** Returns the primary timezone from moment-timezone for a given two-letter country code */
function getPrimaryTimezone(countryCode: string) {
  const tzList = moment.tz.zonesForCountry(countryCode);
  if (tzList && tzList.length > 0) {
    return tzList[0];
  }
  return 'UTC';
}

/** Renders a warning screen for invalid or missing input */
const WarningScreen = ({
  title,
  message,
  usageExample,
  validCodes,
}: {
  title: string;
  message: string;
  usageExample: string;
  validCodes: string[];
}) => (
  <div className="p-6 text-gray-800 bg-white min-h-screen flex flex-col items-center justify-center">
    <h1 className="text-3xl font-bold mb-4 text-red-600">{title}</h1>

    <p className="text-lg text-gray-700 mb-4">{message}</p>

    <p className="text-md text-gray-600 mb-4">
      Correct usage format: <code>/countryCodeHHMM</code>
    </p>
    <p className="text-md text-gray-600 mb-4">
      Example: <code>{usageExample}</code>
    </p>

    <p className="text-md text-gray-600 mb-2">Some valid country codes:</p>
    <ul className="list-disc text-gray-600 pl-5 mb-4">
      {validCodes.map((code) => (
        <li key={code}>{code}</li>
      ))}
    </ul>

    {/* Next.js Link for internal routing to "/searchhelp" */}
    <p className="text-md text-blue-600 underline hover:text-blue-800">
      <Link href="/searchhelp">
        Click here for Search Help (all country codes)
      </Link>
    </p>
  </div>
);

export default function TimezonePage({ params }: TimezonePageProps) {
  /*******************************
   * 1) HOOKS AND INITIAL SETUP  *
   *******************************/
  // Keep track of user-selected countries from the right panel
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);

  // Extract "input" (like "tr1330") from the URL params
  const { input } = use(params);

  /*****************************
   * 2) HANDLE INVALID INPUT   *
   *****************************/
  // Check if there's any input at all, and if it has at least 4 characters
  if (!input || input.length < 4) {
    return (
      <WarningScreen
        title="Warning"
        message="Invalid or incomplete input!"
        usageExample="www.timezone.baby/TR1330"
        validCodes={EXAMPLE_COUNTRY_CODES}
      />
    );
  }

  // countryCode = first 2 letters (e.g. "TR"), timeStr = next 4 digits (e.g. "1330")
  const countryCode = input.slice(0, 2).toUpperCase();
  const timeStr = input.slice(2);

  // timeStr must be 4 digits (e.g. "1330") to parse hours and minutes
  if (timeStr.length !== 4 || isNaN(Number(timeStr))) {
    return (
      <WarningScreen
        title="Warning"
        message="Time must be 4 digits (e.g. 1330)."
        usageExample="www.timezone.baby/TR1330"
        validCodes={EXAMPLE_COUNTRY_CODES}
      />
    );
  }

  // Parse hour and minute
  const hour = parseInt(timeStr.substring(0, 2), 10);
  const minute = parseInt(timeStr.substring(2, 4), 10);

  // Check if the provided country code exists in "world-countries"
  const matchedCountry = countriesData.find(
    (c) => c.cca2.toUpperCase() === countryCode
  );
  if (!matchedCountry) {
    return (
      <WarningScreen
        title="Warning"
        message={`Country code "${countryCode}" not found.`}
        usageExample="www.timezone.baby/TR1330"
        validCodes={EXAMPLE_COUNTRY_CODES}
      />
    );
  }

  // Determine the base timezone for that country
  const baseZone = getPrimaryTimezone(matchedCountry.cca2);

  // Interpret the input time in that country's time zone
  const baseTime = DateTime.fromObject({ hour, minute }, { zone: baseZone });
  if (!baseTime.isValid) {
    return (
      <WarningScreen
        title="Warning"
        message="Invalid time format."
        usageExample="www.timezone.baby/TR1330"
        validCodes={EXAMPLE_COUNTRY_CODES}
      />
    );
  }

  /***********************************
   * 3) PREPARE DATA AND FUNCTIONS   *
   ***********************************/
  // Display the base country's local time in a 12-hour format, e.g. "1.30 PM"
  const formattedLocalTime = baseTime.toFormat('h.mm a');

  // Get the official country name and flag
  const countryName = matchedCountry.name.common;
  const countryFlag = getFlagEmoji(matchedCountry.cca2);

  // Helper: Convert baseTime to another country's local time
  function getCountryTime(timezone: string) {
    try {
      return baseTime.setZone(timezone).toFormat('h:mm a');
    } catch {
      // Fallback if time zone is invalid
      return baseTime.setZone('UTC').toFormat('h:mm a');
    }
  }

  // Handler: "Clear All" button to reset selectedCountries
  function handleClearAll() {
    setSelectedCountries([]);
  }

  /************************
   * 4) RENDER THE PAGE   *
   ************************/
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 text-gray-900">
      {/* Left Panel - base country info & selected countries */}
      <div className="lg:w-1/2 p-6 lg:p-8 border-b lg:border-r border-gray-200">
        {/* Page Title linking back to home */}
        <h1 className="text-2xl lg:text-3xl font-bold mb-6 hover:underline transition-colors">
          <Link href="/">Time Zone Baby</Link>
        </h1>

        {/* Base country's info */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-lg font-semibold text-blue-800">
            Country: {countryName} {countryFlag}
          </p>
          <p className="text-lg font-semibold text-blue-800">
            Time: {formattedLocalTime}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            (Local time in {baseZone})
          </p>
        </div>

        {/* Selected Countries section */}
        {selectedCountries.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Selected Countries</h2>
              <button
                onClick={handleClearAll}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded 
                           hover:bg-red-600 transition-transform transform hover:scale-105"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-3">
              {selectedCountries.map((country) => (
                <div
                  key={country.code}
                  className="p-4 bg-white rounded-lg shadow flex items-center gap-4 
                             transition-transform transform hover:scale-105"
                >
                  <span className="text-2xl">{country.flag}</span>
                  <div>
                    <h3 className="font-semibold">{country.name}</h3>
                    <p className="text-gray-600">
                      {getCountryTime(country.timezone)} ({country.timezone})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Default Time Zones (e.g., Istanbul, Paris, LA) */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Default Time Zones</h2>
          <div className="space-y-3">
            {[
              { name: 'Istanbul', zone: 'Europe/Istanbul', flag: '🇹🇷' },
              { name: 'CET (Paris)', zone: 'Europe/Paris', flag: '🇫🇷' },
              { name: 'Pacific (LA)', zone: 'America/Los_Angeles', flag: '🇺🇸' },
            ].map((tz) => (
              <div
                key={tz.zone}
                className="p-4 bg-white rounded-lg shadow flex items-center gap-4 
                           transition-transform transform hover:scale-105"
              >
                <span className="text-2xl">{tz.flag}</span>
                <div>
                  <h3 className="font-semibold">{tz.name}</h3>
                  <p className="text-gray-600">
                    {getCountryTime(tz.zone)} ({tz.zone})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - CountrySelector component */}
      <div className="lg:w-1/2 p-6 lg:p-8 bg-white">
        <CountrySelector
          onSelectCountry={(country) => {
            // Only add this country if not already in the list
            setSelectedCountries((prev) =>
              prev.some((c) => c.code === country.code)
                ? prev
                : [...prev, country]
            );
          }}
        />
      </div>
    </div>
  );
}
