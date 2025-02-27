"use client";

import React, { useState } from "react";
import { use } from "react";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import countriesData from "world-countries";
import moment from "moment-timezone";
import flags from "emoji-flags";

import TimePicker from "react-time-picker";
import CountrySelector, { Country } from "@/components/CountrySelector";

/** Some example valid codes to show in the warning screen */
const EXAMPLE_CODES = ["TR", "US", "FR", "DE", "GB", "CET", "IST", "PST", "UTC"];

/**
 * Map of special abbreviations to canonical time zone strings.
 * Modify or extend as needed.
 */
const SPECIAL_TZ_MAP: Record<string, string> = {
  CET: "Europe/Paris",        // Central European Time
  IST: "Asia/Kolkata",        // India Standard Time
  PST: "America/Los_Angeles", // Pacific Standard Time
  UTC: "UTC",                 // Coordinated Universal Time
};

/** 
 * Simple screen to show warnings for invalid parameters etc.
 */
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
      Correct usage format: <code>/codeHHMM</code> or <code>/codenow</code>
    </p>
    <p className="text-md text-gray-600 mb-4">
      Example: <code>{usageExample}</code>
    </p>
    <p className="text-md text-gray-600 mb-2">Some valid codes:</p>
    <ul className="list-disc text-gray-600 pl-5 mb-4">
      {validCodes.map((code) => (
        <li key={code}>{code}</li>
      ))}
    </ul>
    <p className="text-md text-blue-600 underline hover:text-blue-800">
      <Link href="/searchhelp">Click here for Search Help (all country codes)</Link>
    </p>
  </div>
);

interface TimezonePageProps {
  params: Promise<{ input: string }>;
}

/**
 * Returns a "primary" timezone for the given 2-letter country code,
 * using moment-timezone’s zonesForCountry.
 */
function getPrimaryTimezoneForCountry(cca2: string): string | null {
  const tzList = moment.tz.zonesForCountry(cca2);
  if (tzList && tzList.length > 0) {
    return tzList[0];
  }
  return null;
}

/**
 * Checks if a string is a valid time portion:
 *   - "now"
 *   - or exactly 4 digits (like "1330")
 */
function isValidTimeString(timeStr: string): boolean {
  if (timeStr.toLowerCase() === "now") return true;
  if (timeStr.length === 4 && !isNaN(Number(timeStr))) return true;
  return false;
}

/**
 * Checks if code is either:
 *   - one of the special abbreviations (CET, IST, PST, UTC)
 *   - or a 2-letter ISO country code found in world-countries
 */
function getTimeZoneFromCode(code: string) {
  const upperCode = code.toUpperCase();

  // 1) Check the special abbreviations
  if (SPECIAL_TZ_MAP[upperCode]) {
    return {
      timezone: SPECIAL_TZ_MAP[upperCode],
      displayName: upperCode,
      flagEmoji: "", // or some fallback like "⌛"
    };
  }

  // 2) Else, check if it's a 2-letter ISO code
  if (upperCode.length === 2) {
    const matchedCountry = countriesData.find(
      (c) => c.cca2.toUpperCase() === upperCode
    );
    if (matchedCountry) {
      const primaryTz = getPrimaryTimezoneForCountry(matchedCountry.cca2);
      if (primaryTz) {
        const flag = flags.countryCode(matchedCountry.cca2)?.emoji || "🏳";
        return {
          timezone: primaryTz,
          displayName: matchedCountry.name.common,
          flagEmoji: flag,
        };
      }
    }
  }

  // 3) Not found
  return null;
}

/**
 * Attempts to parse the user’s input, e.g. "CETnow", "TR1330", "UTCNOW", etc.
 * We try code lengths in [4, 3, 2] (largest first) so that "CETnow" will parse
 * as code="CET", time="now" (rather than code="CE", leftover="Tnow").
 * 
 * If we find a valid code & time portion, return them. Otherwise null.
 */
function parseUserInput(input: string) {
  const cleaned = input.trim();

  // Attempt code lengths in descending order
  for (const codeLen of [4, 3, 2]) {
    if (cleaned.length < codeLen) continue; // skip if not enough length

    const codePart = cleaned.slice(0, codeLen).toUpperCase();
    const timePart = cleaned.slice(codeLen).toLowerCase();

    // Check if codePart is valid
    const zoneInfo = getTimeZoneFromCode(codePart);
    if (!zoneInfo) continue;

    // Check if timePart is valid
    if (!isValidTimeString(timePart)) continue;

    // We have a match
    return {
      codePart,
      timePart,
      zoneInfo,
    };
  }

  // None matched
  return null;
}

/**
 * /[input] => e.g:
 *   /TRnow   => Turkey "now"
 *   /TR1330  => Turkey 13:30
 *   /CETnow  => Paris "now"
 *   /IST0800 => India 08:00
 *   /UTCnow  => UTC "now"
 */
export default function TimezonePage({ params }: TimezonePageProps) {
  const router = useRouter();

  // Selected countries/timezones in the right panel
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);

  // “Change Country & Time” form state
  const [isChanging, setIsChanging] = useState(false);
  const [newCode, setNewCode] = useState("");

  // Radio: now or custom
  const [newTimeMode, setNewTimeMode] = useState<"now" | "custom">("custom");
  // TimePicker value "HH:mm"
  const [newTimeValue, setNewTimeValue] = useState<string>("");

  const [error, setError] = useState("");

  // Await route parameters
  const { input } = use(params);

  // Basic check
  if (!input || input.length < 2) {
    return (
      <WarningScreen
        title="Warning"
        message="Invalid or incomplete input!"
        usageExample="www.timezone.baby/CETnow or /PST1330 or /TR1330"
        validCodes={EXAMPLE_CODES}
      />
    );
  }

  // Attempt to parse
  const parsed = parseUserInput(input);
  if (!parsed) {
    return (
      <WarningScreen
        title="Warning"
        message={`Could not interpret "${input}".`}
        usageExample="www.timezone.baby/CETnow or /IST1330 or /TRnow"
        validCodes={EXAMPLE_CODES}
      />
    );
  }

  const { zoneInfo, timePart } = parsed;

  // Build the base time
  let baseTime: DateTime;
  if (timePart === "now") {
    baseTime = DateTime.now().setZone(zoneInfo.timezone);
  } else {
    // timePart is 4 digits (we already validated)
    const hour = parseInt(timePart.substring(0, 2), 10);
    const minute = parseInt(timePart.substring(2, 4), 10);

    baseTime = DateTime.fromObject({ hour, minute }, { zone: zoneInfo.timezone });
    if (!baseTime.isValid) {
      return (
        <WarningScreen
          title="Warning"
          message="Invalid time or time zone."
          usageExample="www.timezone.baby/CETnow or /IST1330 or /TRnow"
          validCodes={EXAMPLE_CODES}
        />
      );
    }
  }

  const formattedLocalTime = baseTime.toFormat("HH:mm");

  function getCountryTime(timezone: string) {
    try {
      return baseTime.setZone(timezone).toFormat("HH:mm");
    } catch {
      return baseTime.setZone("UTC").toFormat("HH:mm");
    }
  }

  function handleClearAll() {
    setSelectedCountries([]);
  }

  // Change Country & Time form submit
  function handleChangeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newCode || newCode.trim().length < 2) {
      setError("Please enter a valid code (e.g. TR, CET, PST, UTC).");
      return;
    }

    const upperNewCode = newCode.trim().toUpperCase();

    if (newTimeMode === "now") {
      router.push(`/${upperNewCode}now`);
      return;
    }

    // custom => "HH:mm"
    if (!newTimeValue) {
      setError("Please pick a valid time or choose 'now'.");
      return;
    }
    const sanitizedTime = newTimeValue.replace(":", "");
    if (sanitizedTime.length !== 4 || isNaN(Number(sanitizedTime))) {
      setError("Time must be in HH:mm format.");
      return;
    }

    router.push(`/${upperNewCode}${sanitizedTime}`);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 text-gray-900">
      {/* Left Panel */}
      <div className="lg:w-1/2 p-6 lg:p-8 border-b lg:border-r border-gray-200">
        <h1 className="text-2xl lg:text-3xl font-bold mb-6 hover:underline">
          <Link href="/">Time Zone Baby</Link>
        </h1>

        {/* Current Code / TZ / Time */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-lg font-semibold text-blue-800">
            Code / TZ: {zoneInfo.displayName} {zoneInfo.flagEmoji}
          </p>
          <p className="text-lg font-semibold text-blue-800">
            Time: {formattedLocalTime}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            (Local time in {zoneInfo.timezone})
          </p>

          {/* Change Country & Time */}
          {!isChanging && (
            <button
              onClick={() => setIsChanging(true)}
              className="mt-4 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Change Country / TZ &amp; Time
            </button>
          )}

          {isChanging && (
            <form
              onSubmit={handleChangeSubmit}
              className="mt-4 bg-white p-4 rounded shadow"
            >
              {error && <div className="text-red-600 mb-2">{error}</div>}

              <div className="mb-2">
                <label className="block mb-1 font-semibold text-gray-700">
                  New Code (e.g. TR, CET, PST, UTC)
                </label>
                <input
                  type="text"
                  placeholder="TR or CET or PST"
                  className="border border-gray-300 rounded w-full p-2 text-gray-900"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                />
              </div>

              {/* Now - Custom radio */}
              <div className="mb-2">
                <label className="block mb-1 font-semibold text-gray-700">
                  Time Mode
                </label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="timeMode"
                      value="now"
                      checked={newTimeMode === "now"}
                      onChange={() => setNewTimeMode("now")}
                      className="mr-1"
                    />
                    Now
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="timeMode"
                      value="custom"
                      checked={newTimeMode === "custom"}
                      onChange={() => setNewTimeMode("custom")}
                      className="mr-1"
                    />
                    Custom
                  </label>
                </div>
              </div>

              {/* TimePicker if custom */}
              {newTimeMode === "custom" && (
                <div className="mb-2">
                  <label
                    htmlFor="time-picker"
                    className="block mb-1 font-semibold text-gray-700"
                  >
                    Pick Time (HH:mm)
                  </label>
                  <TimePicker
                    id="time-picker"
                    onChange={(value) => setNewTimeValue(value || "")}
                    value={newTimeValue}
                    format="HH:mm"
                    clearIcon={null}
                    className="react-time-picker"
                    disableClock={false}
                  />
                </div>
              )}

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
                  setNewCode("");
                  setNewTimeValue("");
                  setNewTimeMode("custom");
                }}
                className="ml-2 mt-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Selected Countries / Timezones */}
        {selectedCountries.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Selected Countries / Timezones</h2>
              <button
                onClick={handleClearAll}
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

        {/* Popular Timezones */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Popular Timezones</h2>
          <div className="space-y-3">
            {[
              { name: "CET (Paris)", zone: "Europe/Paris", flag: "🇫🇷" },
              { name: "IST (India)", zone: "Asia/Kolkata", flag: "🇮🇳" },
              { name: "PST (LA)", zone: "America/Los_Angeles", flag: "🇺🇸" },
              { name: "UTC", zone: "UTC", flag: "🌐" },
              { name: "Istanbul", zone: "Europe/Istanbul", flag: "🇹🇷" },
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
                    {baseTime.setZone(tz.zone).toFormat("HH:mm")} ({tz.zone})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="lg:w-1/2 p-6 lg:p-8 bg-white">
        <CountrySelector
          onSelectCountry={(c) => {
            // Avoid duplicates
            setSelectedCountries((prev) =>
              prev.some((x) => x.code === c.code) ? prev : [...prev, c]
            );
          }}
        />
      </div>
    </div>
  );
}
