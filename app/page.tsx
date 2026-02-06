"use client";

import {fetchPolls, Poll} from "@/lib/api";
import {useAuth} from "@/lib/auth";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {PollCard} from "@/components/features/poll/PollCard";
import {Navbar} from "@/components/layout/Navbar";

export default function Home() {
  const { isAuthenticated, accessToken } = useAuth();
  const { t } = useTranslation();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPolls = async () => {
      setLoading(true);
      try {
        const data = await fetchPolls(accessToken || undefined);
        setPolls(data);
      } catch (error) {
        console.error("Failed to fetch polls:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPolls();
  }, [accessToken, isAuthenticated]); // Refetch when auth state changes

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
