"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { ApiDocsSearchResult } from "@/app/api/api-docs/search/route";
import type { ApiBranch } from "@/lib/api-docs/types";
import { apiDocsHref } from "@/lib/api-docs/tree";

const DEBOUNCE_MS = 200;
const MIN_QUERY_LENGTH = 2;

export function ApiDocsSearch({ branch }: { branch: ApiBranch }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ApiDocsSearchResult[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    function closeSearch() {
        setOpen(false);
        setQuery("");
        setResults([]);
    }

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((o) => !o);
            }
            if (e.key === "Escape") closeSearch();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    useEffect(() => {
        if (!open) return;
        const id = setTimeout(() => inputRef.current?.focus(), 0);
        return () => clearTimeout(id);
    }, [open]);

    const trimmedQuery = query.trim();

    useEffect(() => {
        if (trimmedQuery.length < MIN_QUERY_LENGTH) return;

        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/api-docs/search?q=${encodeURIComponent(trimmedQuery)}&branch=${branch}`,
                );
                if (!res.ok) return;
                const data = (await res.json()) as ApiDocsSearchResult[];
                if (!cancelled) setResults(data);
            } catch {
                if (!cancelled) setResults([]);
            }
        }, DEBOUNCE_MS);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [trimmedQuery, branch]);

    const visibleResults = trimmedQuery.length >= MIN_QUERY_LENGTH ? results : [];

    function go(result: ApiDocsSearchResult) {
        closeSearch();
        const href = apiDocsHref(branch, result.categorySlug, result.typeSlug);
        router.push(result.anchor ? `${href}#${result.anchor}` : href);
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-zinc-500 transition-colors hover:border-white/20"
            >
                <Search className="h-4 w-4" />
                <span className="flex-1 text-left">Search API</span>
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-600">
                    &#8984;K
                </span>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-24"
                    onClick={closeSearch}
                >
                    <div
                        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                            <Search className="h-4 w-4 text-zinc-500" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search API..."
                                className="w-full bg-transparent font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                            />
                            <button type="button" onClick={closeSearch} className="text-zinc-600 hover:text-white">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {trimmedQuery.length >= MIN_QUERY_LENGTH && visibleResults.length === 0 && (
                                <p className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
                                    No results.
                                </p>
                            )}
                            {visibleResults.map((result, i) => (
                                <button
                                    key={`${result.categorySlug}-${result.typeSlug}-${result.anchor}-${i}`}
                                    type="button"
                                    onClick={() => go(result)}
                                    className="block w-full border-t border-white/5 px-4 py-3 text-left transition-colors first:border-t-0 hover:bg-white/[0.03]"
                                >
                                    <div className="font-mono text-xs text-zinc-500">
                                        {result.typeName}
                                        {result.memberName && (
                                            <>
                                                <span className="text-zinc-700"> &rsaquo; </span>
                                                {result.memberName}
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-1 text-sm text-zinc-300">{result.snippet}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
