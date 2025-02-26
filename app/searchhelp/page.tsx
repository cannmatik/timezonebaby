"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import countriesData from "world-countries";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
// npm i @heroicons/react
import TimePicker from "react-time-picker";
// npm i react-time-picker react-clock
// Ayrıca import "react-time-picker/dist/TimePicker.css"; import "react-clock/dist/Clock.css";

interface CountryItem {
  code: string;
  name: string;
}

export default function Home() {
  const router = useRouter();

  // Ülke arama + seçim
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(
    null
  );

  // Zaman modu
  const [timeMode, setTimeMode] = useState<"now" | "custom">("custom");
  // TimePicker'dan gelen değer "HH:mm" formatında olur
  const [time, setTime] = useState<string>("");

  const [error, setError] = useState("");

  // Tüm ülkeler
  const allCountries = useMemo<CountryItem[]>(() => {
    return countriesData.map((c) => ({
      code: c.cca2.toUpperCase(),
      name: c.name.common,
    }));
  }, []);

  // Ülke filtreleme
  const filteredCountries = useMemo<CountryItem[]>(() => {
    if (!search) return allCountries;
    const lower = search.toLowerCase();
    return allCountries.filter(
      (c) =>
        c.code.toLowerCase().includes(lower) ||
        c.name.toLowerCase().includes(lower)
    );
  }, [search, allCountries]);

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedCountry) {
      setError("Please select a valid country from the list.");
      return;
    }

    if (timeMode === "now") {
      router.push(`/${selectedCountry.code.toLowerCase()}now`);
      return;
    }

    // custom => TimePicker değeri "HH:mm"
    if (!time) {
      setError("Please pick a valid time or choose 'now'.");
      return;
    }

    // "HH:mm" -> "HHMM"
    const sanitizedTime = time.replace(":", "");
    if (sanitizedTime.length !== 4 || isNaN(Number(sanitizedTime))) {
      setError("Time must be in HH:mm format.");
      return;
    }

    router.push(`/${selectedCountry.code.toLowerCase()}${sanitizedTime}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Başlık */}
        <h1 className="text-4xl font-extrabold text-center mb-6">
          Welcome to TimeZone.Baby
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Choose a country and a time mode, then click “Go.”
        </p>

        {/* Hata */}
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/80 rounded-md shadow-md p-6 flex flex-col gap-4"
        >
          {/* Ülke arama */}
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
              className="w-full p-2 rounded bg-gray-900 border border-gray-600
                         placeholder-gray-500 focus:border-blue-500
                         focus:ring focus:ring-blue-500/20 transition-colors"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedCountry(null);
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
                                   transition-colors hover:bg-gray-700
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

          {/* Zaman Modu */}
          <div>
            <label className="block mb-1 font-semibold text-gray-200">
              Time Mode
            </label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="timeMode"
                  value="now"
                  checked={timeMode === "now"}
                  onChange={() => setTimeMode("now")}
                  className="mr-1"
                />
                Now
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="timeMode"
                  value="custom"
                  checked={timeMode === "custom"}
                  onChange={() => setTimeMode("custom")}
                  className="mr-1"
                />
                Custom (HH:mm)
              </label>
            </div>
          </div>

          {/* Custom ise TimePicker göster */}
          {timeMode === "custom" && (
            <div className="mt-2">
              <label
                htmlFor="time-input"
                className="block mb-1 font-semibold text-gray-200"
              >
                Pick Time
              </label>
              <TimePicker
                id="time-input"
                onChange={(value) => setTime(value || "")}
                value={time}
                format="HH:mm"
                clearIcon={null}
                className="react-time-picker"
                disableClock={false} // clock görüntüsünü kapatmak isterseniz true yapabilirsiniz
              />
            </div>
          )}

          {/* Buton */}
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
