"use client";

import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";

export function MaintenancePage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="max-w-md w-full text-center space-y-6">
                    {/* Icon Container */}
                    <div className="mx-auto w-24 h-24 rounded-3xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                        <svg
                            className="w-12 h-12 text-amber-600 dark:text-amber-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            {t("maintenance.title")}
                        </h1>

                        <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                {t("maintenance.description")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
