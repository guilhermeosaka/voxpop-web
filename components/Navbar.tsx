"use client";

import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import Link from "next/link";

export function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const { t } = useTranslation();

    return (
        <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 items-center justify-between gap-4">
                    {/* Logo and Tagline */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm transition-transform group-hover:scale-105">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-4 w-4 text-white"
                            >
                                <path d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                            </svg>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                                VoxPop
                            </span>
                            <span className="hidden text-sm text-zinc-500 dark:text-zinc-400 sm:inline">
                                - Veja o que o mundo pensa
                            </span>
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {/* Create Poll Button - Only for authenticated users */}
                        {isAuthenticated && (
                            <Link
                                href="/create"
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow active:scale-95"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="h-4 w-4"
                                >
                                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                </svg>
                                <span className="hidden sm:inline">{t("home.createPoll")}</span>
                            </Link>
                        )}

                        {/* Auth Button */}
                        {isAuthenticated ? (
                            <button
                                onClick={logout}
                                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            >
                                {t("home.logout")}
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-lg border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-600 transition-all hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-500 dark:hover:bg-emerald-950/30"
                            >
                                {t("home.login")}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
