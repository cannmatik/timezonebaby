"use client";

import React, { useState } from "react";
import { use } from "react";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Head from "next/head"; // Meta etiketleri için
import countriesData from "world-countries";
import moment from "moment-timezone";
import flags from "emoji-flags";

import TimePicker from "react-time-picker";
import CountrySelector, { Country } from "@/components/CountrySelector";

/** Example valid codes for warning screen */
const EXAMPLE_CODES = ["TR", "US", "FR", "DE", "GB", "CET", "IST", "PST", "UTC"];

/** Special timezone abbreviations */
const SPECIAL_TZ_MAP: Record<string, string> = {
  CET: "Europe/Paris",
  IST: "Asia/Kolkata",
  PST: "America/Los_Angeles",
  UTC: "UTC",
};

/** Warning screen component */
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
      Correct usage: <code>/codeHHMM</code> or <code>/codenow</code>
    </p>
    <p className="text-md text-gray-600 mb-4">Example: <code>{usageExample}</code></p>
    <p className="text-md text-gray-600 mb-2">Valid codes:</p>
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

/** Get primary timezone for a country */
function getPrimaryTimezoneForCountry(cca2: string): string | null {
  const tzList = moment.tz.zonesForCountry(cca2);
  return tzList && tzList.length > 0 ? tzList[0] : null;
}

/** Validate time string */
function isValidTimeString(timeStr: string): boolean {
  if (timeStr.toLowerCase() === "now") return true;
  return timeStr.length === 4 && !isNaN(Number(timeStr));
}

/** Get timezone info from code */
function getTimeZoneFromCode(code: string) {
  const upperCode = code.toUpperCase();

  if (SPECIAL_TZ_MAP[upperCode]) {
    return {
      timezone: SPECIAL_TZ_MAP[upperCode],
      displayName: upperCode,
      flagEmoji: "", // Special codes have no flag by default
    };
  }

  if (upperCode.length === 2) {
    const matchedCountry = countriesData.find((c) => c.cca2.toUpperCase() === upperCode);
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

  return null;
}

/** Parse user input (e.g., "CETnow", "TR1330") */
function parseUserInput(input: string) {
  const cleaned = input.trim();

  for (const codeLen of [4, 3, 2]) {
    if (cleaned.length < codeLen) continue;

    const codePart = cleaned.slice(0, codeLen).toUpperCase();
    const timePart = cleaned.slice(codeLen).toLowerCase();

    const zoneInfo = getTimeZoneFromCode(codePart);
    if (!zoneInfo || !isValidTimeString(timePart)) continue;

    return { codePart, timePart, zoneInfo };
  }

  return null;
}

export default function TimezonePage({ params }: TimezonePageProps) {
  const router = useRouter();

  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [isChanging, setIsChanging] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newTimeMode, setNewTimeMode] = useState<"now" | "custom">("custom");
  const [newTimeValue, setNewTimeValue] = useState<string>("");
  const [error, setError] = useState("");

  const { input } = use(params);

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

  let baseTime: DateTime;
  if (timePart === "now") {
    baseTime = DateTime.now().setZone(zoneInfo.timezone);
  } else {
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

  const formattedLocalTime = baseTime.toFormat("hh:mm a"); // 12-hour format (e.g., "2:40 PM")

  // Dynamic meta data for link previews
  const pageTitle = `Timezone Baby: ${
    timePart === "now"
      ? `Current Time in ${zoneInfo.displayName}`
      : `${formattedLocalTime} ${zoneInfo.displayName} Time`
  }`;
  const pageDescription = `Check the time in ${zoneInfo.displayName} (${
    timePart === "now" ? "now" : formattedLocalTime
  }) with Timezone Baby!`;
  const pageImage = zoneInfo.flagEmoji
    ? `/flags/${parsed.codePart.toLowerCase()}.png` // Hypothetical flag image path
    : "https://www.timezone.baby/favicon.ico"; // Fallback

  function getCountryTime(timezone: string) {
    try {
      return baseTime.setZone(timezone).toFormat("hh:mm a");
    } catch {
      return baseTime.setZone("UTC").toFormat("hh:mm a");
    }
  }

  function handleClearAll() {
    setSelectedCountries([]);
  }

  function handleChangeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newCode || newCode.trim().length < 2) {
      setError("Please enter a valid code (e.g., TR, CET, PST, UTC).");
      return;
    }

    const upperNewCode = newCode.trim().toUpperCase();

    if (newTimeMode === "now") {
      router.push(`/${upperNewCode}now`);
      return;
    }

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
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.timezone.baby/${input}`} />
        <meta property="og:image" content={pageImage} />
      </Head>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 text-gray-900">
        {/* Left Panel */}
        <div className="lg:w-1/2 p-6 lg:p-8 border-b lg:border-r border-gray-200">
          <h1 className="text-2xl lg:text-3xl font-bold mb-6 hover:underline">
            <Link href="/">Time Zone Baby</Link>
          </h1>

          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-blue-800">
              Code / TZ: {zoneInfo.displayName} {zoneInfo.flagEmoji}
            </p>
            <p className="text-lg font-semibold text-blue-800">Time: {formattedLocalTime}</p>
            <p className="text-sm text-gray-600 mt-2">
              (Local time in {zoneInfo.timezone})
            </p>

            {!isChanging && (
              <button
                onClick={() => setIsChanging(true)}
                className="mt-4 px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Change Country / TZ & Time
              </button>
            )}

            {isChanging && (
              <form onSubmit={handleChangeSubmit} className="mt-4 bg-white p-4 rounded shadow">
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <div className="mb-2">
                  <label className="block mb-1 font-semibold text-gray-700">
                    New Code (e.g., TR, CET, PST, UTC)
                  </label>
                  <input
                    type="text"
                    placeholder="TR or CET or PST"
                    className="border border-gray-300 rounded w-full p-2 text-gray-900"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="mb-2">
                  <label className="block mb-1 font-semibold text-gray-700">Time Mode</label>
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

          {selectedCountries.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Selected Countries / Timezones</h2>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-transform transform hover:scale-105"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-3">
                {selectedCountries.map((c) => (
                  <div
                    key={c.code}
                    className="p-4 bg-white rounded-lg shadow flex items-center gap-4 transition-transform transform hover:scale-105"
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
                  className="p-4 bg-white rounded-lg shadow flex items-center gap-4 transition-transform transform hover:scale-105"
                >
                  <span className="text-2xl">{tz.flag}</span>
                  <div>
                    <h3 className="font-semibold">{tz.name}</h3>
                    <p className="text-gray-600">
                      {baseTime.setZone(tz.zone).toFormat("hh:mm a")} ({tz.zone})
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
            onSelectCountry={(c) =>
              setSelectedCountries((prev) =>
                prev.some((x) => x.code === c.code) ? prev : [...prev, c]
              )
            }
          />
        </div>
      </div>
    </>
  );
}