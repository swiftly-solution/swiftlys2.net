"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { GameEventSearchResult } from "@/app/api/gameevents/search/route";
import { parseSearchQuery, tokenValue } from "@/lib/search/query";
import { useViewerSearch } from "@/components/search/viewer-search-context";

const MIN_SEARCH_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 250;

export function GameEventsSearchResults({ gameId }: { gameId: string }) {
    const { query } = useViewerSearch();
    const [searchResults, setSearchResults] = useState<GameEventSearchResult[]>(
        [],
    );

    const parsed = useMemo(() => parseSearchQuery(query), [query]);
    const normalizedQuery = parsed.freeText.trim().toLowerCase();
    const fieldToken = tokenValue(parsed.tokens, "field");
    const fileToken = tokenValue(parsed.tokens, "file");

    const hasSearch =
        normalizedQuery.length >= MIN_SEARCH_QUERY_LENGTH ||
        Boolean(fieldToken || fileToken);

    useEffect(() => {
        if (!hasSearch) {
            setSearchResults([]);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ game: gameId });
                if (normalizedQuery) params.set("q", normalizedQuery);
                if (fieldToken) params.set("field", fieldToken);
                if (fileToken) params.set("file", fileToken);

                const res = await fetch(
                    `/api/gameevents/search?${params.toString()}`,
                );
                if (!res.ok) return;
                const data = (await res.json()) as GameEventSearchResult[];
                if (!cancelled) setSearchResults(data);
            } catch {
                if (!cancelled) setSearchResults([]);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [gameId, hasSearch, normalizedQuery, fieldToken, fileToken]);

    if (searchResults.length === 0) return null;

    return (
        <div className="mb-4 max-h-72 space-y-1 overflow-y-auto border-b border-white/10 pb-4">
            <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                Results ({searchResults.length})
            </div>
            {searchResults.map((result) => (
                <Link
                    key={result.name}
                    href={`/gameevents-viewer/${gameId}/${encodeURIComponent(result.name)}`}
                    className="flex items-center gap-2 rounded-lg px-2 py-1 font-mono text-xs text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-accent"
                >
                    <span className="text-accent">E</span>
                    <span className="min-w-0 flex-1 truncate">
                        {result.name}
                        {result.matchedField && (
                            <>
                                <span className="text-zinc-600">.</span>
                                {result.matchedField}
                            </>
                        )}
                    </span>
                    {result.hash && (
                        <span className="shrink-0 text-zinc-600">
                            {result.hash}
                        </span>
                    )}
                </Link>
            ))}
        </div>
    );
}
