"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import countriesData from "world-countries";

interface CountryItem {
  code: string;
  name: string;
}

export default function Home() {
  const router = useRouter();

  // Kullanıcı tarafından seçilecek/verilecek veriler:
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<CountryItem | null>(null);
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  // Tüm ülkeleri büyük/küçük harften bağımsız filtreleyebilmek için, 
  // world-countries verisinden { code, name } objeleri oluşturuyoruz:
  const allCountries = useMemo<CountryItem[]>(() => {
    return countriesData.map((c) => ({
      code: c.cca2.toUpperCase(),
      name: c.name.common,
    }));
  }, []);

  // Arama kutusuna girilen değeri, hem ülke koduna hem de ülke adına göre filtreliyoruz:
  const filteredCountries = useMemo<CountryItem[]>(() => {
    if (!search) return allCountries;
    const lower = search.toLowerCase();
    return allCountries.filter(
      (c) =>
        c.code.toLowerCase().includes(lower) ||
        c.name.toLowerCase().includes(lower)
    );
  }, [search, allCountries]);

  // Form submit olduğunda, önce Time (HHMM) formatını kontrol ediyoruz
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Her yeni submit’te hatayı sıfırlayalım

    // Geçerli bir ülke seçilip seçilmediğini kontrol edelim
    if (!country) {
      setError("Please select a valid country from the list.");
      return;
    }

    // Time (HHMM) formatını regex ile kontrol edelim (00:00 ~ 23:59)
    // 2 haneli saat (00-23), 2 haneli dakika (00-59):
    const timeRegex = /^(0\d|1\d|2[0-3])([0-5]\d)$/; 
    if (!timeRegex.test(time)) {
      setError("Please enter the time with following syntax HHMM ex:1330).");
      return;
    }

    // Her şey uygunsa, rotaya yönlendir
    // "/tr1330" gibi formatta
    router.push(`/${country.code.toLowerCase()}${time}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Başlık */}
        <h1 className="text-4xl font-extrabold text-center mb-6">
          Welcome to TimeZone.Baby
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Choose a country and desired time (HHMM), then click “Go.”
        </p>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/80 rounded-md shadow-md p-6 flex flex-col gap-4"
        >
          {/* Ülke Arama ve Seçimi */}
          <div>
            <label
              htmlFor="country-search"
              className="block mb-1 font-semibold text-gray-200"
            >
              Search or Select Country
            </label>
            <input
              id="country-search"
              type="text"
              placeholder="Type country name or code (e.g., TR, Turkey)..."
              className="w-full p-2 rounded bg-gray-900 border border-gray-600 placeholder-gray-500 focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCountry(null);
              }}
            />
            {/* Filtrelenmiş ülke listesini gösteren panel */}
            {search && (
              <div className="max-h-40 overflow-y-auto bg-gray-900 border border-gray-600 mt-2 rounded">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((item) => (
                    <div
                      key={item.code}
                      className={`px-3 py-2 hover:bg-gray-700 cursor-pointer ${
                        country?.code === item.code ? "bg-gray-700" : ""
                      }`}
                      onClick={() => {
                        setCountry(item);
                        setSearch(item.name); // Seçtiğinde arama alanına ülkenin ismini yaz
                      }}
                    >
                      {item.name} ({item.code})
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-400">
                    No matching countries found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Time Input (HHMM) */}
          <div>
            <label
              htmlFor="time-input"
              className="block mb-1 font-semibold text-gray-200"
            >
              Time (HHMM)
            </label>
            <input
              id="time-input"
              type="text"
              placeholder="e.g. 1330"
              maxLength={4}
              className="w-full p-2 rounded bg-gray-900 border border-gray-600 placeholder-gray-500 focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
              }}
            />
          </div>

          {/* Gönder Butonu */}
          <button
            type="submit"
            className="mt-2 w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-transform hover:scale-105"
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
