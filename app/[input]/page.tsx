"use client";

import React, { useState } from "react";
import { use } from "react";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import countriesData from "world-countries";
import moment from "moment-timezone";
import flags from "emoji-flags";

import CountrySelector, { Country } from "@/components/CountrySelector";

const EXAMPLE_COUNTRY_CODES = ["TR", "US", "NL", "FR", "DE", "GB", "IT", "ES"];

/** Returns a flag emoji (or fallback) for a given country code */
function getFlagEmoji(countryCode: string) {
  return flags.countryCode(countryCode)?.emoji || "🏳";
}

/** Returns the primary timezone from moment-timezone for a given two-letter country code */
function getPrimaryTimezone(countryCode: string) {
  const tzList = moment.tz.zonesForCountry(countryCode);
  if (tzList && tzList.length > 0) {
    return tzList[0];
  }
  return "UTC";
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
      Correct usage format: <code>/countryCodeHHMM</code> or <code>/countryCodenow</code>
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

    <p className="text-md text-blue-600 underline hover:text-blue-800">
      <Link href="/searchhelp">
        Click here for Search Help (all country codes)
      </Link>
    </p>
  </div>
);

interface TimezonePageProps {
  // In Next.js 13 with the App Router, "params" can be a Promise<{ input: string }>
  params: Promise<{ input: string }>;
}

/**
 * This page shows the local time for /[input], e.g. /TR1330 => 13:30 in Turkey,
 * or /INnow => current time in India.
 */
export default function TimezonePage({ params }: TimezonePageProps) {
  const router = useRouter();
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);

  // "isChanging" controls the "Change Country & Time" mini-form
  const [isChanging, setIsChanging] = useState(false);
  const [newCountry, setNewCountry] = useState("");
  const [newTime, setNewTime] = useState("");
  const [error, setError] = useState("");

  // Get the dynamic route param
  const { input } = use(params);

  /*******************************
   * 1) Validate the URL "input" *
   *******************************/
  if (!input || input.length < 2) {
    return (
      <WarningScreen
        title="Warning"
        message="Invalid or incomplete input!"
        usageExample="www.timezone.baby/INnow or /TR1330"
        validCodes={EXAMPLE_COUNTRY_CODES}
      />
    );
  }

  // Example inputs:
  //  - "TR1330" => countryCode = "TR", timeStr = "1330"
  //  - "INnow"  => countryCode = "IN", timeStr = "now"
  const countryCode = input.slice(0, 2).toUpperCase();
  const remainingPart = input.slice(2).toLowerCase();

  // Check if the country code is valid
  const matchedCountry = countriesData.find(
    (c) => c.cca2.toUpperCase() === countryCode
  );
  if (!matchedCountry) {
    return (
      <WarningScreen
        title="Warning"
        message={`Country code "${countryCode}" not found.`}
        usageExample="www.timezone.baby/INnow or /TR1330"
        validCodes={EXAMPLE_COUNTRY_CODES}
      />
    );
  }

  // figure out hour and minute
  let hour: number | null = null;
  let minute: number | null = null;

  if (remainingPart === "now") {
    // The user wants the current time (system time)
    const now = new Date();
    hour = now.getHours();
    minute = now.getMinutes();
  } else {
    // The user gave a 4-digit time
    if (remainingPart.length !== 4 || isNaN(Number(remainingPart))) {
      return (
        <WarningScreen
          title="Warning"
          message="Time must be 4 digits (e.g. 1330) or 'now'."
          usageExample="www.timezone.baby/INnow or /TR1330"
          validCodes={EXAMPLE_COUNTRY_CODES}
        />
      );
    }
    hour = parseInt(remainingPart.substring(0, 2), 10);
    minute = parseInt(remainingPart.substring(2, 4), 10);
  }

  // 2) Determine time zone
  function getPrimaryTimezone(countryCode: string) {
    const tzList = moment.tz.zonesForCountry(countryCode);
    if (tzList && tzList.length > 0) {
      return tzList[0];
    }
    return "UTC";
  }
  const baseZone = getPrimaryTimezone(matchedCountry.cca2);

  // 3) Create a Luxon DateTime from hour, minute, zone
  if (hour == null || minute == null) {
    return (
      <WarningScreen
        title="Warning"
        message="Invalid time format or incomplete input."
        usageExample="www.timezone.baby/INnow or /TR1330"
        validCodes={EXAMPLE_COUNTRY_CODES}
      />
    );
  }

  const baseTime = DateTime.fromObject({ hour, minute }, { zone: baseZone });
  if (!baseTime.isValid) {
    return (
      <WarningScreen
        title="Warning"
        message="Invalid time or time zone."
        usageExample="www.timezone.baby/INnow or /TR1330"
        validCodes={EXAMPLE_COUNTRY_CODES}
      />
    );
  }

  // 4) Show info
  const countryName = matchedCountry.name.common;
  const countryFlag = flags.countryCode(matchedCountry.cca2)?.emoji || "🏳";
  const formattedLocalTime = baseTime.toFormat("h.mm a");

  // Convert baseTime to another country's local time
  function getCountryTime(timezone: string) {
    try {
      return baseTime.setZone(timezone).toFormat("h:mm a");
    } catch {
      return baseTime.setZone("UTC").toFormat("h:mm a");
    }
  }

  // "Clear All" button
  function handleClearAll() {
    setSelectedCountries([]);
  }

  // The mini-form for changing country/time
  function handleChangeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newCountry || newCountry.length < 2) {
      setError("Please enter a valid 2-letter country code (e.g., TR).");
      return;
    }
    // If "now", we skip time format check
    if (newTime.toLowerCase() === "now") {
      router.push(`/${newCountry.toLowerCase()}now`);
      return;
    }
    // Otherwise, HHMM check
    const timeRegex = /^(0\d|1\d|2[0-3])([0-5]\d)$/;
    if (!timeRegex.test(newTime)) {
      setError("Please enter a valid time (HHMM), e.g. 1330 or 'now'.");
      return;
    }
    // success
    router.push(`/${newCountry.toLowerCase()}${newTime}`);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 text-gray-900">
      {/* Left Panel */}
      <div className="lg:w-1/2 p-6 lg:p-8 border-b lg:border-r border-gray-200">
        {/* Page Title */}
        <h1 className="text-2xl lg:text-3xl font-bold mb-6 hover:underline transition-colors">
          <Link href="/">Time Zone Baby</Link>
        </h1>

        {/* Base Country Info */}
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

          {/* "Change Country & Time" button */}
          {!isChanging && (
            <button
              onClick={() => setIsChanging(true)}
              className="mt-4 px-3 py-2 bg-indigo-600 text-white rounded 
                         hover:bg-indigo-700 transition-colors"
            >
              Change Country &amp; Time
            </button>
          )}

          {/* If isChanging = true, show the mini form */}
          {isChanging && (
            <form onSubmit={handleChangeSubmit} className="mt-4 bg-white p-4 rounded shadow">
              {error && <div className="text-red-600 mb-2">{error}</div>}

              <div className="mb-2">
                <label className="block mb-1 font-semibold text-gray-700">
                  New Country Code (e.g. TR)
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded w-full p-2 text-gray-900"
                  maxLength={2}
                  placeholder="IN"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value.toUpperCase())}
                />
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-semibold text-gray-700">
                  New Time (HHMM or "now")
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded w-full p-2 text-gray-900"
                  maxLength={4}
                  placeholder="1330 or now"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsChanging(false);
                  setError("");
                  setNewCountry("");
                  setNewTime("");
                }}
                className="ml-2 mt-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Selected Countries List */}
        {selectedCountries.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Selected Countries</h2>
              <button
                onClick={() => handleClearAll()}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded 
                           hover:bg-red-600 transition-transform transform hover:scale-105"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-3">
              {selectedCountries.map((c) => (
                <div
                  key={c.code}
                  className="p-4 bg-white rounded-lg shadow flex items-center gap-4 
                             transition-transform transform hover:scale-105"
                >
                  <span className="text-2xl">{c.flag}</span>
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="text-gray-600">
                      {getCountryTime(c.timezone)} ({c.timezone})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Timezones (Renamed from "Default Time Zones") */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Popular Timezones</h2>
          <div className="space-y-3">
            {[
              { name: "Istanbul", zone: "Europe/Istanbul", flag: "🇹🇷" },
              { name: "CET (Paris)", zone: "Europe/Paris", flag: "🇫🇷" },
              { name: "Pacific (LA)", zone: "America/Los_Angeles", flag: "🇺🇸" },
              { name: "India (IST)", zone: "Asia/Kolkata", flag: "🇮🇳" }, // <--- ADDED
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
                    {baseTime.setZone(tz.zone).toFormat("h:mm a")} ({tz.zone})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - CountrySelector */}
      <div className="lg:w-1/2 p-6 lg:p-8 bg-white">
        <CountrySelector
          onSelectCountry={(c) => {
            // Don’t add duplicates
            setSelectedCountries((prev) =>
              prev.some((x) => x.code === c.code) ? prev : [...prev, c]
            );
          }}
        />
      </div>
    </div>
  );
}
