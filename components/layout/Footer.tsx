"use client";

import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/features/i18n/LanguageSwitcher";

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    &copy; {new Date().getFullYear()} {t("common.appName")}. All rights reserved.
                </p>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{t("common.language")}:</span>
                    <LanguageSwitcher />
                </div>
            </div>
        </footer>
    );
}
