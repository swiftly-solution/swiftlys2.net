"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ConvarSearchResult } from "@/app/api/convars/search/route";
import { parseSearchQuery, tokenValue } from "@/lib/search/query";
import { useViewerSearch } from "@/components/search/viewer-search-context";

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 250;

export function ConvarsSearchResults({ gameId }: { gameId: string }) {
    const { query } = useViewerSearch();
    const [results, setResults] = useState<ConvarSearchResult[]>([]);

    const parsed = useMemo(() => parseSearchQuery(query), [query]);
    const normalizedQuery = parsed.freeText.trim().toLowerCase();
    const moduleToken = tokenValue(parsed.tokens, "module");
    const rawKindToken = tokenValue(parsed.tokens, "kind");
    const kindToken =
        rawKindToken === "convar" || rawKindToken === "concommand"
            ? rawKindToken
            : undefined;
    const flagToken = tokenValue(parsed.tokens, "flag");
    const attrToken = tokenValue(parsed.tokens, "attr");

    const hasSearch =
        normalizedQuery.length >= MIN_QUERY_LENGTH ||
        Boolean(moduleToken || kindToken || flagToken || attrToken);

    useEffect(() => {
        if (!hasSearch) {
            setResults([]);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ game: gameId });
                if (normalizedQuery) params.set("q", normalizedQuery);
                if (moduleToken) params.set("module", moduleToken);
                if (kindToken) params.set("kind", kindToken);
                if (flagToken) params.set("flag", flagToken);
                if (attrToken) params.set("attr", attrToken);

                const res = await fetch(
                    `/api/convars/search?${params.toString()}`,
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
    }, [
        gameId,
        hasSearch,
        normalizedQuery,
        moduleToken,
        kindToken,
        flagToken,
        attrToken,
    ]);

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
