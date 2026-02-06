"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CountrySelect } from "./CountrySelect";
import { parsePhoneNumber, AsYouType, CountryCode } from "libphonenumber-js";

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  error?: string;
}

export function PhoneNumberInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  error,
}: PhoneNumberInputProps) {
  const { t } = useTranslation();

  // Extract country from phone number or default to BR
  const getCountryFromValue = (phoneValue: string): string => {
    if (!phoneValue) return "BR";
    try {
      const parsed = parsePhoneNumber(phoneValue);
      return parsed?.country || "BR";
    } catch {
      return "BR";
    }
  };

  const [country, setCountry] = useState<string>(getCountryFromValue(value));

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    // Clear the phone number when country changes
    onChange("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Format as you type
    const formatter = new AsYouType(country as CountryCode);
    formatter.input(input);

    // Get the full international format
    const phoneNumber = formatter.getNumber();
    if (phoneNumber) {
      onChange(phoneNumber.number as string);
    } else {
      onChange(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value) {
      onSubmit();
    }
  };

  // Display formatted phone number
  const displayValue = (() => {
    if (!value) return "";
    try {
      const parsed = parsePhoneNumber(value);
      return parsed?.formatNational() || value;
    } catch {
      return value;
    }
  })();

  return (
    <div className="w-full">
      <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        {t("login.phoneLabel")}
      </label>
      <div className="flex gap-2">
        <CountrySelect
          value={country}
          onChange={handleCountryChange}
          disabled={disabled}
        />
        <input
          id="phone"
          type="tel"
          value={displayValue}
          onChange={handlePhoneChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={t("login.phonePlaceholder")}
          className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg
                             bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                             disabled:opacity-50 disabled:cursor-not-allowed
                             placeholder-zinc-400 dark:placeholder-zinc-500
                             transition-all"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
