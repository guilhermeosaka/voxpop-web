"use client";

import { fetchPolls, Poll, PollSortBy, GetPollsParams } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PollCard } from "@/components/features/poll/PollCard";
import { Navbar } from "@/components/layout/Navbar";
import { SortSelect } from "@/components/ui/SortSelect";
import { MaintenancePage } from "@/components/features/maintenance/MaintenancePage";

export default function Home() {
  const { isAuthenticated, accessToken } = useAuth();
  const { t } = useTranslation();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);

  // Filter & Sort State
  const [sortBy, setSortBy] = useState<PollSortBy>(PollSortBy.TotalVotesDesc);
  const [filterMode, setFilterMode] = useState<"all" | "my-polls" | "my-votes">("all");

  useEffect(() => {
    const loadPolls = async () => {
      setLoading(true);
      setIsMaintenance(false);
      try {
        const params: GetPollsParams = {
          sortBy,
          createdByMe: filterMode === "my-polls",
          votedByMe: filterMode === "my-votes"
        };
        const data = await fetchPolls(accessToken || undefined, params);
        setPolls(data);
      } catch (error) {
        if (error instanceof Error && (error.message === "503" || error.message === "Failed to fetch")) {
          // Check if non-prod environment
          const env = process.env.NEXT_PUBLIC_ENVIRONMENT || "development";
          if (env !== "production" && env !== "prod") {
            setIsMaintenance(true);
          }
        }
        console.error("Failed to fetch polls:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPolls();
  }, [accessToken, isAuthenticated, sortBy, filterMode]); // Refetch when params change

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                        ${filterMode === "all"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800"}`}
            >
              {t("home.filters.all")}
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setFilterMode("my-polls")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                                ${filterMode === "my-polls"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800"}`}
                >
                  {t("home.filters.myPolls")}
                </button>
                <button
                  onClick={() => setFilterMode("my-votes")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                                ${filterMode === "my-votes"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800"}`}
                >
                  {t("home.filters.myVotes")}
                </button>
              </>
            )}
          </div>

          <div className="relative z-50">
            <SortSelect value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-voxpop-gold"></div>
          </div>
        ) : polls.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {polls.map((poll) => (
              <div key={poll.id} className="break-inside-avoid mb-6">
                <PollCard poll={poll} isAuthenticated={isAuthenticated} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 py-32 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">{t("home.noPolls.title")}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("home.noPolls.description")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
