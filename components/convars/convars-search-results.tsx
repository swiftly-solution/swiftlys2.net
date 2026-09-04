"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ConvarSearchResult } from "@/app/api/convars/search/route";
import { parseSearchQuery } from "@/lib/search/query";
import { useViewerSearch } from "@/components/search/viewer-search-context";

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 250;

export function ConvarsSearchResults({ gameId }: { gameId: string }) {
    const { query } = useViewerSearch();
    const [results, setResults] = useState<ConvarSearchResult[]>([]);

    const normalizedQuery = parseSearchQuery(query).freeText.trim().toLowerCase();

    useEffect(() => {
        if (normalizedQuery.length < MIN_QUERY_LENGTH) {
            setResults([]);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/convars/search?game=${gameId}&q=${encodeURIComponent(normalizedQuery)}`,
                );
                if (!res.ok) return;
                const data = (await res.json()) as ConvarSearchResult[];
                if (!cancelled) setResults(data);
            } catch {
                if (!cancelled) setResults([]);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [gameId, normalizedQuery]);

    if (results.length === 0) return null;

    return (
        <div className="mb-4 max-h-72 space-y-1 overflow-y-auto border-b border-white/10 pb-4">
            <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                Results ({results.length})
            </div>
            {results.map((r) => (
                <Link
                    key={`${r.module}/${r.name}`}
                    href={`/convars-viewer/${gameId}/${r.module}/${encodeURIComponent(r.name)}`}
                    className="flex items-center gap-2 rounded-lg px-2 py-1 font-mono text-xs text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-accent"
                >
                    <span
                        className={
                            r.kind === "concommand"
                                ? "text-amber-400"
                                : "text-accent"
                        }
                    >
                        {r.kind === "concommand" ? "X" : "V"}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{r.name}</span>
                    <span className="shrink-0 text-zinc-600">{r.module}</span>
                </Link>
            ))}
        </div>
    );
}
