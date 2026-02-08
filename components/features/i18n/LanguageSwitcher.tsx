"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";

const languages = [
    { code: "en-US", name: "English", flag: "us" },
    { code: "pt-BR", name: "Português", flag: "br" },
];

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = languages.find((lang) =>
        i18n.language?.startsWith(lang.code) || lang.code.startsWith(i18n.language || "")
    ) || languages[0];

    // Close dropdown when clicking outside
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

    const handleLanguageChange = async (languageCode: string) => {
        await i18n.changeLanguage(languageCode);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-zinc-200 dark:border-zinc-700 
                 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100
                 hover:border-voxpop-gold dark:hover:border-voxpop-gold
                 focus:outline-none focus:ring-2 focus:ring-voxpop-gold/20 focus:border-voxpop-gold
                 transition-all duration-200"
                aria-label="Select language"
            >
                <div className="relative w-5 h-4 rounded-sm overflow-hidden">
                    <Image
                        src={`https://flagcdn.com/w40/${currentLanguage.flag}.png`}
                        alt={`${currentLanguage.name} flag`}
                        fill
                        className="object-cover"
                        sizes="20px"
                    />
                </div>
                <span className="text-sm font-medium">{currentLanguage.name}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mb-2 bottom-full w-48 bg-white dark:bg-zinc-900 border border-zinc-200 
                      dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden z-50">
                    {languages.map((language) => {
                        const isSelected = i18n.language?.startsWith(language.code) || language.code.startsWith(i18n.language || "");

                        return (
                            <button
                                key={language.code}
                                type="button"
                                onClick={() => handleLanguageChange(language.code)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left
                          hover:bg-voxpop-gold-light dark:hover:bg-voxpop-gold/10
                          transition-colors
                          ${isSelected ? "bg-voxpop-gold-light dark:bg-voxpop-gold/10" : ""}`}
                            >
                                <div className="relative w-5 h-4 rounded-sm overflow-hidden shrink-0">
                                    <Image
                                        src={`https://flagcdn.com/w40/${language.flag}.png`}
                                        alt={`${language.name} flag`}
                                        fill
                                        className="object-cover"
                                        sizes="20px"
                                    />
                                </div>
                                <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                    {language.name}
                                </span>
                                {isSelected && (
                                    <svg className="w-5 h-5 text-voxpop-gold" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
