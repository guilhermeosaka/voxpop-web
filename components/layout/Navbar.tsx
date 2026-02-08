"use client";

import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const { t } = useTranslation();

    return (
        <nav className="sticky top-0 z-[100] border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 items-center justify-between gap-4">
                    {/* Logo and Tagline */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center transition-transform group-hover:scale-105">
                            <Image
                                src="/voxpop-logo.svg"
                                alt="Voxpop Logo"
                                width={32}
                                height={32}
                                className="h-8 w-8"
                            />
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                                Voxpop
                            </span>
                            <span className="hidden text-sm text-zinc-500 dark:text-zinc-400 sm:inline">
                                {t("home.subtitle")}
                            </span>
                        </div>
                    </Link>



                    {/* Create Poll Button - Only for authenticated users */}

                    <div className="flex items-center gap-2">
                        {isAuthenticated && (
                            <Link
                                href="/create"
                                className="flex items-center gap-1.5 rounded-lg bg-voxpop-gold px-3 py-1.5 text-sm font-medium text-voxpop-brown transition-colors hover:bg-voxpop-gold-dark"
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
                                className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 
                                backdrop-blur-md px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 
                                transition-all hover:bg-white/80 dark:hover:bg-zinc-800/80 hover:text-voxpop-gold dark:hover:text-voxpop-gold
                                hover:border-voxpop-gold/30 dark:hover:border-voxpop-gold/30 shadow-sm"
                            >
                                {t("home.login")}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav >
    );
}
