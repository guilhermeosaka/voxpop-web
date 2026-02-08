"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PollSortBy } from "@/lib/api";

interface SortSelectProps {
    value: PollSortBy;
    onChange: (value: PollSortBy) => void;
    disabled?: boolean;
}

export function SortSelect({ value, onChange, disabled = false }: SortSelectProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const sortOptions = [
        {
            value: PollSortBy.CreatedAtDesc,
            label: t("sort.newest"),
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            )
        },
        {
            value: PollSortBy.CreatedAtAsc,
            label: t("sort.oldest"),
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            value: PollSortBy.TotalVotesDesc,
            label: t("sort.popular"),
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
            )
        },
        {
            value: PollSortBy.ExpiresAtAsc,
            label: t("sort.expiring"),
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    const selectedOption = sortOptions.find(opt => opt.value === value) || sortOptions[0];

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
                className={`flex items-center justify-between gap-3 px-3 py-2 
                    rounded-xl border transition-all duration-300 min-w-36
                    backdrop-blur-md shadow-sm
                    ${isOpen
                        ? "bg-zinc-100/80 border-zinc-300 dark:bg-zinc-800/80 dark:border-zinc-700 ring-2 ring-voxpop-gold/10 dark:ring-voxpop-gold/20"
                        : "bg-white/60 border-zinc-200/60 dark:bg-zinc-900/60 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white/80 dark:hover:bg-zinc-800/80"}
                    disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-zinc-500 dark:text-zinc-400">
                        {selectedOption.icon}
                    </span>
                    <span className="text-sm font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
                        {selectedOption.label}
                    </span>
                </div>
                <svg
                    className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-zinc-600 dark:text-zinc-300" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full min-w-48 p-1.5
                    bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl 
                    border border-zinc-200/50 dark:border-zinc-800/50 
                    rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/5
                    animate-in fade-in zoom-in-95 duration-200 origin-top-right right-0">
                    <div className="flex flex-col gap-0.5">
                        {sortOptions.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`group relative flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium rounded-xl
                                        transition-all duration-200
                                        ${isSelected
                                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"}`}
                                >
                                    <span className={`transition-colors duration-200 ${isSelected ? "text-voxpop-gold" : "text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300"}`}>
                                        {option.icon}
                                    </span>
                                    <span className="flex-1 tracking-tight">{option.label}</span>
                                    {isSelected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-voxpop-gold shadow-[0_0_8px_rgba(255,208,83,0.5)]" />
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
