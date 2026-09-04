"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
    EnumValueSearchResult,
    FieldSearchResult,
    SchemaSearchResponse,
} from "@/app/api/schema/search/route";
import { parseSearchQuery, tokenValue } from "@/lib/search/query";
import { useViewerSearch } from "@/components/search/viewer-search-context";

const MIN_FIELD_QUERY_LENGTH = 2;
const FIELD_SEARCH_DEBOUNCE_MS = 250;

export function SchemaSearchResults({ gameId }: { gameId: string }) {
    const { query } = useViewerSearch();
    const [fieldMatches, setFieldMatches] = useState<FieldSearchResult[]>([]);
    const [enumMatches, setEnumMatches] = useState<EnumValueSearchResult[]>([]);

    const parsed = useMemo(() => parseSearchQuery(query), [query]);
    const normalizedQuery = parsed.freeText.trim().toLowerCase();
    const fieldToken = tokenValue(parsed.tokens, "field");
    const typeToken = tokenValue(parsed.tokens, "type");
    const offsetToken = tokenValue(parsed.tokens, "offset");
    const enumvalueToken = tokenValue(parsed.tokens, "enumvalue");
    const rawNetworkedToken = tokenValue(parsed.tokens, "networked")?.toLowerCase();
    const networkedToken =
        rawNetworkedToken === "true" || rawNetworkedToken === "false"
            ? rawNetworkedToken
            : undefined;

    useEffect(() => {
        const hasFieldSearch =
            normalizedQuery.length >= MIN_FIELD_QUERY_LENGTH ||
            Boolean(fieldToken || typeToken || offsetToken || networkedToken);
        const hasEnumSearch = Boolean(enumvalueToken);

        if (!hasFieldSearch) setFieldMatches([]);
        if (!hasEnumSearch) setEnumMatches([]);
        if (!hasFieldSearch && !hasEnumSearch) return;

        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ game: gameId });
                if (normalizedQuery) params.set("q", normalizedQuery);
                if (fieldToken) params.set("field", fieldToken);
                if (typeToken) params.set("type", typeToken);
                if (offsetToken) params.set("offset", offsetToken);
                if (enumvalueToken) params.set("enumvalue", enumvalueToken);
                if (networkedToken) params.set("networked", networkedToken);

                const res = await fetch(
                    `/api/schema/search?${params.toString()}`,
                );
                if (!res.ok) return;
                const data = (await res.json()) as SchemaSearchResponse;
                if (!cancelled) {
                    setFieldMatches(hasFieldSearch ? data.fields : []);
                    setEnumMatches(hasEnumSearch ? data.enumValues : []);
                }
            } catch {
                if (!cancelled) {
                    setFieldMatches([]);
                    setEnumMatches([]);
                }
            }
        }, FIELD_SEARCH_DEBOUNCE_MS);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [
        gameId,
        normalizedQuery,
        fieldToken,
        typeToken,
        offsetToken,
        enumvalueToken,
        networkedToken,
    ]);

    if (fieldMatches.length === 0 && enumMatches.length === 0) return null;

    return (
        <div className="mb-4 max-h-72 space-y-4 overflow-y-auto border-b border-white/10 pb-4">
            {fieldMatches.length > 0 && (
                <div>
                    <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                        Fields ({fieldMatches.length})
                    </div>
                    <div className="mt-1.5 space-y-1">
                        {fieldMatches.map((match) => (
                            <Link
                                key={`${match.project}/${match.className}/${match.fieldName}`}
                                href={`/schema-viewer/${gameId}/${match.project}/${encodeURIComponent(match.className)}#field-${encodeURIComponent(match.fieldName)}`}
                                className="flex items-center gap-2 rounded-lg px-2 py-1 font-mono text-xs text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-accent"
                            >
                                <span className="text-zinc-600">F</span>
                                <span className="min-w-0 flex-1 truncate">
                                    {match.className}
                                    <span className="text-zinc-600">.</span>
                                    {match.fieldName}
                                    <span className="text-zinc-600">
                                        {" "}
                                        : {match.fieldType}
                                    </span>
                                </span>
                                {match.networked && (
                                    <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                                        net
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {enumMatches.length > 0 && (
                <div>
                    <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                        Enum values ({enumMatches.length})
                    </div>
                    <div className="mt-1.5 space-y-1">
                        {enumMatches.map((match) => (
                            <Link
                                key={`${match.project}/${match.enumName}/${match.memberName}`}
                                href={`/schema-viewer/${gameId}/${match.project}/${encodeURIComponent(match.enumName)}`}
                                className="flex items-center gap-2 rounded-lg px-2 py-1 font-mono text-xs text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-accent"
                            >
                                <span className="text-amber-400">E</span>
                                <span className="min-w-0 flex-1 truncate">
                                    {match.enumName}
                                    <span className="text-zinc-600">.</span>
                                    {match.memberName}
                                    <span className="text-zinc-600">
                                        {" "}
                                        = {match.value}
                                    </span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
