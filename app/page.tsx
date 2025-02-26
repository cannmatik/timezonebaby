"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import countriesData from "world-countries";
import { CheckCircleIcon } from "@heroicons/react/24/solid"; // For the check icon (install @heroicons/react if you haven't)

interface CountryItem {
  code: string;
  name: string;
}

export default function Home() {
  const router = useRouter();

  // For searching and selecting a country
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(null);

  // For time input
  // "mode" can be "now" or "custom"
  const [timeMode, setTimeMode] = useState<"now" | "custom">("custom");
  const [time, setTime] = useState("");

  // Error messages
  const [error, setError] = useState("");

  // Build an array of countries from world-countries
  const allCountries = useMemo<CountryItem[]>(() => {
    return countriesData.map((c) => ({
      code: c.cca2.toUpperCase(),
      name: c.name.common,
    }));
  }, []);

  // Filter countries based on user search
  const filteredCountries = useMemo<CountryItem[]>(() => {
    if (!search) return allCountries;
    const lower = search.toLowerCase();
    return allCountries.filter(
      (c) =>
        c.code.toLowerCase().includes(lower) ||
        c.name.toLowerCase().includes(lower)
    );
  }, [search, allCountries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1) Check if a country is selected
    if (!selectedCountry) {
      setError("Please select a valid country from the list.");
      return;
    }

    // 2) If user chose "now"
    if (timeMode === "now") {
      router.push(`/${selectedCountry.code.toLowerCase()}now`);
      return;
    }

    // 3) Otherwise, user must provide a valid HHMM
    const timeRegex = /^(0\d|1\d|2[0-3])([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      setError("Please enter time in HHMM format (e.g. 1330).");
      return;
    }

    // 4) If all is good, push to the route
    router.push(`/${selectedCountry.code.toLowerCase()}${time}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center mb-6">
          Welcome to TimeZone.Baby
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Choose a country and a time mode, then click “Go.”
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/80 rounded-md shadow-md p-6 flex flex-col gap-4"
        >
          {/* Country Search */}
          <div>
            <label
              htmlFor="country-search"
              className="block mb-1 font-semibold text-gray-200"
            >
              Search or Select a Country
            </label>
            <input
              id="country-search"
              type="text"
              placeholder="Type name or code (e.g. TR, Turkey)..."
              className="w-full p-2 rounded bg-gray-900 border border-gray-600 placeholder-gray-500
                         focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedCountry(null); // reset selected country if user changes search
              }}
            />

            {search && (
              <div className="max-h-40 overflow-y-auto bg-gray-900 border border-gray-600 mt-2 rounded">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((item) => {
                    const isSelected = selectedCountry?.code === item.code;
                    return (
                      <div
                        key={item.code}
                        className={`px-3 py-2 flex items-center justify-between cursor-pointer 
                                   transition-colors 
                                   hover:bg-gray-700
                                   ${isSelected ? "bg-green-600" : ""}`}
                        onClick={() => {
                          setSelectedCountry(item);
                          setSearch(item.name);
                        }}
                      >
                        <span>
                          {item.name} ({item.code})
                        </span>
                        {isSelected && (
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-gray-400">
                    No matching countries found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Time Input Mode */}
          <div className="mt-4">
            <label className="block mb-1 font-semibold text-gray-200">
              Time Mode
            </label>
            <div className="flex gap-4 items-center">
              {/* Radio for 'now' */}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="timeMode"
                  value="now"
                  className="mr-1"
                  checked={timeMode === "now"}
                  onChange={() => setTimeMode("now")}
                />
                Now
              </label>

              {/* Radio for 'custom' */}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="timeMode"
                  value="custom"
                  className="mr-1"
                  checked={timeMode === "custom"}
                  onChange={() => setTimeMode("custom")}
                />
                Custom (HHMM)
              </label>
            </div>
          </div>

          {/* If custom time is chosen, show input */}
          {timeMode === "custom" && (
            <div>
              <label
                htmlFor="time-input"
                className="block mb-1 font-semibold text-gray-200 mt-2"
              >
                Time (HHMM)
              </label>
              <input
                id="time-input"
                type="text"
                placeholder="e.g. 1330"
                maxLength={4}
                className="w-full p-2 rounded bg-gray-900 border border-gray-600 placeholder-gray-500
                           focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-6 w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold
                       transition-transform hover:scale-105"
          >
            Go
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-sm text-gray-400">
        Developed by{" "}
        <span className="text-xl font-black text-blue-400">Can Matik</span>
        <span className="ml-2 text-xl font-black text-red-500 animate-pulse">
          With Love
        </span>
      </footer>
    </div>
  );
}
