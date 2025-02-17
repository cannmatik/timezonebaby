'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [country, setCountry] = useState('TR');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construct the URL path (e.g. "/tr1330")
    router.push(`/${country.toLowerCase()}${time}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-8">
      {/* Main container with a max width */}
      <div className="w-full max-w-md">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center mb-6">
          Welcome to TimeZone.Baby
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Choose your country code and desired time, then click “Go.”
        </p>

        {/* Dark panel for the form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/80 rounded-md shadow-md p-6 flex flex-col gap-4"
        >
          {/* Country Select */}
          <div>
            <label
              htmlFor="country-select"
              className="block mb-1 font-semibold text-gray-200"
            >
              Country Code
            </label>
            <select
              id="country-select"
              className="w-full p-2 rounded bg-gray-900 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 transition-colors"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="TR">TR (Turkey)</option>
              <option value="US">US (USA)</option>
              <option value="NL">NL (Netherlands)</option>
              <option value="FR">FR (France)</option>
              <option value="DE">DE (Germany)</option>
              <option value="GB">GB (United Kingdom)</option>
            </select>
          </div>

          {/* Time Input */}
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
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Submit Button */}
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
        <span className="text-xl font-black text-blue-400">
          Can Matik
        </span>
        <span className="ml-2 text-xl font-black text-red-500 animate-pulse">
          With Love
        </span>
      </footer>
    </div>
  );
}
