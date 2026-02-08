"use client";

import { useState, useRef, useEffect } from "react";
import { PollSortBy } from "@/lib/api";

interface SortSelectProps {
    value: PollSortBy;
    onChange: (value: PollSortBy) => void;
    disabled?: boolean;
}

const SORT_OPTIONS = [
    {
        value: PollSortBy.CreatedAtDesc,
        label: "Newest",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        )
    },
    {
        value: PollSortBy.CreatedAtAsc,
        label: "Oldest",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )
    },
    {
        value: PollSortBy.TotalVotesDesc,
        label: "Popular",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
        )
    },
    {
        value: PollSortBy.ExpiresAtAsc,
        label: "Expiring Soon",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }
];

export function SortSelect({ value, onChange, disabled = false }: SortSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = SORT_OPTIONS.find(opt => opt.value === value) || SORT_OPTIONS[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (newValue: PollSortBy) => {
        onChange(newValue);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="flex items-center gap-2 px-3 py-2 border border-zinc-200 dark:border-zinc-700 
                 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100
                 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800
                 focus:outline-none focus:ring-2 focus:ring-voxpop-gold/20 focus:border-voxpop-gold
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-200 min-w-40 justify-between"
            >
                <div className="flex items-center gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400">
                        {selectedOption.icon}
                    </span>
                    <span className="text-sm font-medium">{selectedOption.label}</span>
                </div>
                <svg
                    className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full min-w-40 bg-white dark:bg-zinc-900 border border-zinc-200
                      dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right right-0">
                    <div className="py-1">
                        {SORT_OPTIONS.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm
                            transition-colors
                            ${isSelected
                                            ? "bg-voxpop-gold-light/20 text-voxpop-brown dark:bg-voxpop-gold/10 dark:text-voxpop-gold"
                                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                                >
                                    <span className={`${isSelected ? "text-voxpop-gold" : "text-zinc-400"}`}>
                                        {option.icon}
                                    </span>
                                    <span>{option.label}</span>
                                    {isSelected && (
                                        <svg
                                            className="w-4 h-4 ml-auto text-voxpop-gold"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
