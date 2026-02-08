"use client";

import { Poll, VoteMode, votePoll, deleteVote } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface PollCardProps {
    poll: Poll;
    isAuthenticated?: boolean;
}

export function PollCard({ poll, isAuthenticated = false }: PollCardProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const { accessToken } = useAuth();
    // Poll is expired only if expiresAt exists and is in the past
    const isExpired = poll.expiresAt ? new Date(poll.expiresAt) < new Date() : false;

    // Local state for optimistic updates
    const [votes, setVotes] = useState<Record<string, number>>({});
    const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
    const [loadingOption, setLoadingOption] = useState<string | null>(null);

    // Sync state with poll props (handle refetch/auth change)
    useEffect(() => {
        setVotes(
            poll.options.reduce((acc, opt) => ({ ...acc, [opt.id]: opt.votes }), {})
        );
        setUserVotes(
            new Set(poll.options.filter((o) => o.hasVoted).map((o) => o.id))
        );
    }, [poll]);

    // Calculate total votes
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

    const handleVote = async (e: React.MouseEvent, optionId: string) => {
        e.preventDefault(); // Prevent Link navigation

        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        if (isExpired || !accessToken || loadingOption) return;

        setLoadingOption(optionId);

        try {
            if (userVotes.has(optionId)) {
                // Unvote
                await deleteVote(poll.id, optionId, accessToken);

                // Optimistic update for unvote
                setVotes((prev) => ({
                    ...prev,
                    [optionId]: Math.max(0, (prev[optionId] || 0) - 1),
                }));

                setUserVotes((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(optionId);
                    return newSet;
                });
            } else {
                // Vote
                await votePoll(poll.id, optionId, accessToken);

                // Optimistic update for vote
                setVotes((prev) => {
                    const newVotes = { ...prev };
                    newVotes[optionId] = (newVotes[optionId] || 0) + 1;

                    // If single choice, remove previous vote IF we tracked it locally in this session
                    if (poll.voteMode === VoteMode.SingleChoice) {
                        for (const prevVoteId of userVotes) {
                            if (prevVoteId !== optionId && newVotes[prevVoteId] > 0) {
                                newVotes[prevVoteId]--;
                            }
                        }
                    }
                    return newVotes;
                });

                setUserVotes((prev) => {
                    const newSet = new Set(prev);
                    if (poll.voteMode === VoteMode.SingleChoice) {
                        newSet.clear();
                    }
                    newSet.add(optionId);
                    return newSet;
                });
            }

        } catch (error) {
            console.error("Failed to vote:", error);
            // Could show a toast/notification here
        } finally {
            setLoadingOption(null);
        }
    };

    return (
        <div
            className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 transition-all duration-300 hover:shadow-md dark:bg-zinc-900 
            ${poll.hasCreated
                    ? "ring-voxpop-gold/50 hover:ring-voxpop-gold dark:ring-voxpop-gold/50 dark:hover:ring-voxpop-gold"
                    : "ring-zinc-200 hover:ring-zinc-300 dark:ring-zinc-800 dark:hover:ring-zinc-700"
                }`}
        >
            {/* <Link href={`/polls/${poll.id}`} className="absolute inset-0 z-0" /> */}
            <div className="relative z-10 flex flex-col gap-4 pointer-events-none">
                {/* Status Badge */}
                <div className="flex items-start justify-between">
                    <div className="flex flex-wrap gap-2">
                        {poll.hasCreated && (
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-voxpop-gold-light text-voxpop-brown dark:bg-voxpop-gold/10 dark:text-voxpop-gold">
                                {t("poll.createdByYou")}
                            </span>
                        )}
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${isExpired
                                ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                : "bg-voxpop-gold-light text-voxpop-brown dark:bg-voxpop-gold/10 dark:text-voxpop-gold"
                                }`}
                        >
                            {isExpired ? t("poll.status.closed") : t("poll.status.active")}
                        </span>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {poll.voteMode === VoteMode.MultipleChoice ? t("poll.mode.multiple") : t("poll.mode.single")}
                        </span>
                    </div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap ml-2">
                        {new Date(poll.createdAt).toLocaleDateString()}
                    </span>
                </div>

                {/* Question */}
                <h3 className="text-xl font-medium tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                    {poll.question}
                </h3>
            </div>

            {/* Options */}
            <div className="relative z-20 mt-6 flex flex-col gap-2">
                {poll.options.map((option) => {
                    const currentVotes = votes[option.id] || 0;
                    const percentage = totalVotes > 0 ? (currentVotes / totalVotes) * 100 : 0;
                    const isSelected = userVotes.has(option.id);
                    const isLoading = loadingOption === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={(e) => handleVote(e, option.id)}
                            disabled={isExpired || isLoading}
                            className={`relative flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all overflow-hidden
              ${isSelected
                                    ? "border-voxpop-gold bg-voxpop-gold-light text-voxpop-brown dark:bg-voxpop-gold/10 dark:text-voxpop-gold ring-1 ring-voxpop-gold"
                                    : "border-zinc-200 bg-transparent text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                                }
              ${isExpired
                                    ? "cursor-default opacity-100 hover:bg-transparent dark:hover:bg-transparent"
                                    : isSelected && poll.voteMode === VoteMode.MultipleChoice
                                        ? "cursor-default"
                                        : "cursor-pointer active:scale-[0.98]"
                                }
            `}
                        >
                            {/* Progress bar background */}
                            <div
                                className="absolute inset-0 bg-voxpop-gold-light/50 dark:bg-voxpop-gold/5 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />

                            {/* Content */}
                            <div className="relative flex w-full items-center justify-between">
                                <span>{option.value}</span>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        <span className="font-semibold">{currentVotes}</span>
                                        <span>·</span>
                                        <span>{percentage.toFixed(1)}%</span>
                                    </div>
                                    {isLoading ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-voxpop-gold border-t-transparent dark:border-voxpop-gold" />
                                    ) : isSelected && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-5 w-5 text-voxpop-gold dark:text-voxpop-gold"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
                {!isAuthenticated && !isExpired && (
                    <Link
                        href="/login"
                        className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-500 hover:text-voxpop-gold dark:hover:text-voxpop-gold transition-colors"
                    >
                        {t("poll.loginToVote")}
                    </Link>
                )}
            </div>
        </div>
    );
}
