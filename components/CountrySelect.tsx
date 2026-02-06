"use client";

import { useState, useRef, useEffect } from "react";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import en from "react-phone-number-input/locale/en.json";
import type { CountryCode } from "libphonenumber-js";

import Image from "next/image";

interface CountrySelectProps {
    value: string;
    onChange: (country: string) => void;
    disabled?: boolean;
}

export function CountrySelect({ value, onChange, disabled = false }: CountrySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const countries = getCountries();

    // Filter countries based on search
    const filteredCountries = countries.filter((country) => {
        const countryName = en[country] || country;
        const callingCode = getCountryCallingCode(country);
        const searchLower = search.toLowerCase();

        return (
            countryName.toLowerCase().includes(searchLower) ||
            country.toLowerCase().includes(searchLower) ||
            callingCode.includes(search)
        );
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (country: string) => {
        onChange(country);
        setIsOpen(false);
        setSearch("");
    };

    const selectedCallingCode = value ? `+${getCountryCallingCode(value as CountryCode)}` : "";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="flex items-center gap-2 px-3 py-2 border border-zinc-200 dark:border-zinc-700 
                         rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100
                         hover:border-emerald-500 dark:hover:border-emerald-500
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 min-w-[120px]"
            >
                {value && (
                    <div className="relative w-6 h-4 rounded-sm overflow-hidden">
                        <Image
                            src={`https://flagcdn.com/w40/${value.toLowerCase()}.png`}
                            alt={`${value} flag`}
                            fill
                            className="object-cover"
                            sizes="24px"
                        />
                    </div>
                )}
                <span className="text-sm font-medium">{selectedCallingCode}</span>
                <svg
                    className={`w-4 h-4 ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 
                              dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-zinc-200 dark:border-zinc-700">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search countries..."
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 
                                     dark:border-zinc-700 rounded-md text-sm
                                     focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                                     text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
                                     transition-all"
                        />
                    </div>

                    {/* Country List */}
                    <div className="max-h-64 overflow-y-auto">
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => {
                                const countryName = en[country as keyof typeof en] || country;
                                const callingCode = getCountryCallingCode(country);
                                const isSelected = country === value;

                                return (
                                    <button
                                        key={country}
                                        type="button"
                                        onClick={() => handleSelect(country)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left
                                                  hover:bg-emerald-50 dark:hover:bg-emerald-950/30
                                                  transition-colors
                                                  ${isSelected ? "bg-emerald-50 dark:bg-emerald-950/30" : ""}`}
                                    >
                                        <div className="relative w-6 h-4 rounded-sm overflow-hidden flex-shrink-0">
                                            <Image
                                                src={`https://flagcdn.com/w40/${country.toLowerCase()}.png`}
                                                alt={`${country} flag`}
                                                fill
                                                className="object-cover"
                                                sizes="24px"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                {countryName}
                                            </div>
                                        </div>
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                            +{callingCode}
                                        </span>
                                        {isSelected && (
                                            <svg
                                                className="w-5 h-5 text-emerald-500"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                No countries found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
