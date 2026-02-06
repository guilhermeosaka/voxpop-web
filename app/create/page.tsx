"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import { createPoll, VoteMode } from "@/lib/api";
import Link from "next/link";
import {Navbar} from "@/components/layout/Navbar";
import {DateTimePicker} from "@/components/ui/DateTimePicker";

export default function CreatePollPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { isAuthenticated, accessToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [question, setQuestion] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [voteMode, setVoteMode] = useState<VoteMode>(VoteMode.SingleChoice);
    const [options, setOptions] = useState<string[]>(["", ""]);

    // Redirect if not authenticated
    if (!isAuthenticated) {
        router.push("/login");
        return null;
    }

    const addOption = () => {
        setOptions([...options, ""]);
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!question.trim()) {
            setError(t("poll.create.errors.questionRequired"));
            return;
        }

        const filledOptions = options.filter((opt) => opt.trim());
        if (filledOptions.length < 2) {
            setError(t("poll.create.errors.minOptions"));
            return;
        }

        if (options.some((opt) => opt.trim() && opt.trim().length === 0)) {
            setError(t("poll.create.errors.emptyOption"));
            return;
        }

        if (!accessToken) {
            setError("Not authenticated");
            return;
        }

        setLoading(true);

        try {
            // Convert empty expiresAt to null, otherwise format with timezone
            let formattedExpiresAt: string | null = null;
            if (expiresAt.trim()) {
                // datetime-local gives us format: "2026-06-01T14:30"
                // We need to add seconds and timezone: "2026-06-01T14:30:00-03:00"
                const date = new Date(expiresAt);
                const tzOffset = -date.getTimezoneOffset();
                const tzHours = Math.floor(Math.abs(tzOffset) / 60).toString().padStart(2, '0');
                const tzMinutes = (Math.abs(tzOffset) % 60).toString().padStart(2, '0');
                const tzSign = tzOffset >= 0 ? '+' : '-';
                formattedExpiresAt = `${expiresAt}:00${tzSign}${tzHours}:${tzMinutes}`;
            }

            await createPoll(
                {
                    question: question.trim(),
                    expiresAt: formattedExpiresAt,
                    voteMode,
                    options: filledOptions.map((value) => ({ value: value.trim() })),
                },
                accessToken
            );

            // Redirect to home on success
            router.push("/");
            // Force a refresh to update the poll list with new auth state
            router.refresh();
        } catch (err) {
            setError(t("poll.create.errors.createFailed"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <Navbar />

            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden">
                    {/* Header */}
                    <div className="bg-white dark:bg-zinc-900 px-8 py-6 border-b border-zinc-200 dark:border-zinc-800">
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            {t("poll.create.title")}
                        </h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            {t("poll.create.questionPlaceholder")}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Question */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                                {t("poll.create.question")}
                            </label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder={t("poll.create.questionPlaceholder")}
                                className="w-full px-4 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-voxpop-gold/40 focus:border-voxpop-gold transition-all"
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Expires At */}
                            <DateTimePicker
                                value={expiresAt}
                                onChange={setExpiresAt}
                                disabled={loading}
                                label={t("poll.create.expiresAt")}
                                optional={true}
                            />

                            {/* Vote Mode */}
                            <div>
                                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                                    {t("poll.create.voteMode")}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setVoteMode(VoteMode.SingleChoice)}
                                        disabled={loading}
                                        className={`relative px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all cursor-pointer ${voteMode === VoteMode.SingleChoice
                                            ? "border-voxpop-gold bg-voxpop-gold-light dark:bg-voxpop-gold/10 text-voxpop-brown dark:text-voxpop-gold"
                                            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
                                            }`}
                                    >
                                        {voteMode === VoteMode.SingleChoice && (
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-voxpop-gold"></div>
                                        )}
                                        {t("poll.create.singleChoice")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setVoteMode(VoteMode.MultipleChoice)}
                                        disabled={loading}
                                        className={`relative px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all cursor-pointer ${voteMode === VoteMode.MultipleChoice
                                            ? "border-voxpop-gold bg-voxpop-gold-light dark:bg-voxpop-gold/10 text-voxpop-brown dark:text-voxpop-gold"
                                            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
                                            }`}
                                    >
                                        {voteMode === VoteMode.MultipleChoice && (
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-voxpop-gold"></div>
                                        )}
                                        {t("poll.create.multipleChoice")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Options */}
                        <div>
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                                {t("poll.create.options")}
                            </label>
                            <div className="space-y-3">
                                {options.map((option, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-12 flex items-center justify-center">
                                            <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-600">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => updateOption(index, e.target.value)}
                                            placeholder={t("poll.create.optionPlaceholder", { number: index + 1 })}
                                            className="flex-1 px-4 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-voxpop-gold/40 focus:border-voxpop-gold transition-all"
                                            disabled={loading}
                                        />
                                        {options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                                                disabled={loading}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    className="w-5 h-5"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addOption}
                                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-voxpop-gold hover:text-voxpop-gold-dark dark:text-voxpop-gold dark:hover:text-voxpop-gold-dark hover:bg-voxpop-gold-light dark:hover:bg-voxpop-gold/10 rounded-lg transition-colors cursor-pointer"
                                disabled={loading}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                </svg>
                                {t("poll.create.addOption")}
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 p-4 flex items-start gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-sm font-medium text-red-600 dark:text-red-400">{error}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3.5 px-6 bg-voxpop-gold hover:bg-voxpop-gold-dark disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-voxpop-brown disabled:text-zinc-400 dark:disabled:text-zinc-500 font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-voxpop-gold focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        {t("poll.create.creating")}
                                    </span>
                                ) : (
                                    t("poll.create.submit")
                                )}
                            </button>
                            <Link
                                href="/"
                                className="px-6 py-3.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors flex items-center justify-center border-2 border-zinc-200 dark:border-zinc-700"
                            >
                                {t("poll.create.cancel")}
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
