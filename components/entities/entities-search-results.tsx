"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
    EntityFieldSearchResult,
    EntitySearchResponse,
} from "@/app/api/entities/search/route";
import { parseSearchQuery, tokenValue } from "@/lib/search/query";
import { useViewerSearch } from "@/components/search/viewer-search-context";

const MIN_FIELD_QUERY_LENGTH = 2;
const FIELD_SEARCH_DEBOUNCE_MS = 250;

const KIND_LABEL: Record<EntityFieldSearchResult["kind"], string> = {
    input: "I",
    output: "O",
    member: "M",
};

const KIND_ANCHOR: Record<
    EntityFieldSearchResult["kind"],
    (match: EntityFieldSearchResult) => string
> = {
    input: (m) => `input-${m.externalName}`,
    output: (m) => `output-${m.externalName}`,
    member: (m) => `member-${m.fieldName}`,
};

export function EntitiesSearchResults({ gameId }: { gameId: string }) {
    const { query } = useViewerSearch();
    const [classes, setClasses] = useState<string[]>([]);
    const [fieldMatches, setFieldMatches] = useState<EntityFieldSearchResult[]>(
        [],
    );

    const parsed = useMemo(() => parseSearchQuery(query), [query]);
    const normalizedQuery = parsed.freeText.trim().toLowerCase();
    const kindToken = tokenValue(parsed.tokens, "kind");
    const fieldToken = tokenValue(parsed.tokens, "field");

    useEffect(() => {
        const hasSearch =
            normalizedQuery.length >= MIN_FIELD_QUERY_LENGTH ||
            Boolean(kindToken || fieldToken);
        if (!hasSearch) {
            setClasses([]);
            setFieldMatches([]);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ game: gameId });
                if (normalizedQuery) params.set("q", normalizedQuery);
                if (kindToken) params.set("kind", kindToken);
                if (fieldToken) params.set("field", fieldToken);

                const res = await fetch(
                    `/api/entities/search?${params.toString()}`,
                );
                if (!res.ok) return;
                const data = (await res.json()) as EntitySearchResponse;
                if (!cancelled) {
                    setClasses(data.classes);
                    setFieldMatches(data.fields);
                }
            } catch {
                if (!cancelled) {
                    setClasses([]);
                    setFieldMatches([]);
                }
            }
        }, FIELD_SEARCH_DEBOUNCE_MS);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [gameId, normalizedQuery, kindToken, fieldToken]);

    if (classes.length === 0 && fieldMatches.length === 0) return null;

    return (
        <div className="mb-4 max-h-72 space-y-4 overflow-y-auto border-b border-white/10 pb-4">
            {classes.length > 0 && (
                <div>
                    <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                        Entities ({classes.length})
                    </div>
                    <div className="mt-1.5 space-y-1">
                        {classes.map((name) => (
                            <Link
                                key={name}
                                href={`/entity-viewer/${gameId}/${encodeURIComponent(name)}`}
                                className="flex items-center gap-2 rounded-lg px-2 py-1 font-mono text-xs text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-accent"
                            >
                                <span className="text-accent">E</span>
                                <span className="min-w-0 flex-1 truncate">
                                    {name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {fieldMatches.length > 0 && (
                <div>
                    <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                        Inputs / Outputs / Members ({fieldMatches.length})
                    </div>
                    <div className="mt-1.5 space-y-1">
                        {fieldMatches.map((match) => (
                            <Link
                                key={`${match.className}/${match.kind}/${match.fieldName}`}
                                href={`/entity-viewer/${gameId}/${encodeURIComponent(match.className)}#${KIND_ANCHOR[match.kind](match)}`}
                                className="flex items-center gap-2 rounded-lg px-2 py-1 font-mono text-xs text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-accent"
                            >
                                <span className="text-zinc-600">
                                    {KIND_LABEL[match.kind]}
                                </span>
                                <span className="min-w-0 flex-1 truncate">
                                    {match.className}
                                    <span className="text-zinc-600">.</span>
                                    {match.externalName}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
