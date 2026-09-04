"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { VIEWERS } from "@/components/viewers-menu";
import {
    parseSearchQuery,
    stripSitePrefix,
    type GlobalSearchGroup,
    type GlobalSearchResponse,
} from "@/lib/search/query";
import {
    VIEWER_FILTER_KEYS,
    VIEWER_HREF,
    type ViewerId,
} from "@/lib/search/filter-config";
import { useViewerSearch } from "@/components/search/viewer-search-context";

const GLOBAL_SEARCH_DEBOUNCE_MS = 250;
const MIN_GLOBAL_QUERY_LENGTH = 2;

const SOURCE_LABELS: Record<GlobalSearchGroup["source"], string> = {
    schema: "Schema",
    convars: "Convars & Commands",
    protobuf: "Protobuf",
    entities: "Entities",
    gameevents: "Game Events",
    docs: "Docs",
};

export function ViewerSearchBar({
    viewerId,
    gameId,
    placeholder,
    resultsSlot,
}: {
    viewerId: ViewerId;
    gameId: string;
    placeholder: string;
    resultsSlot?: ReactNode;
}) {
    const { query, setQuery } = useViewerSearch();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { isGlobal, rest } = stripSitePrefix(query);
    const globalText = rest.trim().toLowerCase();

    const [globalResults, setGlobalResults] =
        useState<GlobalSearchResponse | null>(null);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [globalError, setGlobalError] = useState(false);

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get("q")) {
            setOpen(true);
        }
    }, []);

    useEffect(() => {
        if (!isGlobal || globalText.length < MIN_GLOBAL_QUERY_LENGTH) {
            setGlobalResults(null);
            setGlobalLoading(false);
            setGlobalError(false);
            return;
        }

        setGlobalLoading(true);
        setGlobalError(false);
        let cancelled = false;
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/search/global?game=${gameId}&q=${encodeURIComponent(globalText)}`,
                );
                if (!res.ok) throw new Error("bad response");
                const data = (await res.json()) as GlobalSearchResponse;
                if (!cancelled) setGlobalResults(data);
            } catch {
                if (!cancelled) setGlobalError(true);
            } finally {
                if (!cancelled) setGlobalLoading(false);
            }
        }, GLOBAL_SEARCH_DEBOUNCE_MS);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [isGlobal, globalText, gameId]);

    useEffect(() => {
        if (!open) return;
        const onDocClick = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const filterKeys = VIEWER_FILTER_KEYS[viewerId];
    const alsoIn = VIEWERS.filter((v) => v.href !== VIEWER_HREF[viewerId]);
    const freeTextForLinks = parseSearchQuery(query).freeText;

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            <div
                className={`flex items-center gap-2 rounded-full border bg-black/40 px-4 py-2 font-mono text-sm transition-colors ${
                    open
                        ? "border-accent/60 ring-2 ring-accent/20"
                        : "border-white/10"
                }`}
            >
                <Search className="h-4 w-4 shrink-0 text-zinc-500" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setOpen(true)}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-white placeholder:text-zinc-600 focus:outline-none"
                />
            </div>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 w-[28rem] max-w-[90vw] rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur">
                    {isGlobal ? (
                        <GlobalResults
                            text={globalText}
                            loading={globalLoading}
                            error={globalError}
                            data={globalResults}
                            gameId={gameId}
                            viewerId={viewerId}
                            onNavigate={() => setOpen(false)}
                            onLocalQuery={(text) => {
                                setQuery(text);
                                setOpen(false);
                            }}
                        />
                    ) : (
                        <>
                            {resultsSlot}

                            <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                                Filters
                            </div>
                            <div className="mt-2 space-y-2.5">
                                {filterKeys.map((f) => (
                                    <div
                                        key={f.key}
                                        className="flex items-baseline justify-between gap-3"
                                    >
                                        <div className="min-w-0">
                                            <span className="font-mono text-sm font-semibold text-accent">
                                                {f.key}:
                                            </span>
                                            <span className="ml-2 font-mono text-xs text-zinc-400">
                                                {f.description}
                                            </span>
                                        </div>
                                        <span className="shrink-0 font-mono text-[10px] text-zinc-600">
                                            e.g. {f.example}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 border-t border-white/10 pt-3 font-mono text-xs uppercase tracking-wide text-zinc-500">
                                Also in
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {alsoIn.map((viewer) => (
                                    <Link
                                        key={viewer.href}
                                        href={`${viewer.href}/${gameId}${
                                            freeTextForLinks
                                                ? `?q=${encodeURIComponent(freeTextForLinks)}`
                                                : ""
                                        }`}
                                        onClick={() => setOpen(false)}
                                        className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-zinc-300 transition-colors hover:border-accent/40 hover:text-accent"
                                    >
                                        {viewer.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-4 border-t border-white/10 pt-3 font-mono text-[10px] text-zinc-600">
                                Type <span className="text-accent">site:</span>{" "}
                                to search the whole site.
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function GlobalResults({
    text,
    loading,
    error,
    data,
    gameId,
    viewerId,
    onNavigate,
    onLocalQuery,
}: {
    text: string;
    loading: boolean;
    error: boolean;
    data: GlobalSearchResponse | null;
    gameId: string;
    viewerId: ViewerId;
    onNavigate: () => void;
    onLocalQuery: (text: string) => void;
}) {
    if (text.length < MIN_GLOBAL_QUERY_LENGTH) {
        return (
            <p className="font-mono text-xs text-zinc-500">
                Keep typing to search the whole site&hellip;
            </p>
        );
    }
    if (loading && !data) {
        return (
            <p className="font-mono text-xs text-zinc-500">searching&hellip;</p>
        );
    }
    if (error) {
        return (
            <p className="font-mono text-xs text-zinc-500">
                Search is temporarily unavailable.
            </p>
        );
    }

    const groups = (data?.groups ?? []).filter((g) => g.items.length > 0);
    if (groups.length === 0) {
        return <p className="font-mono text-xs text-zinc-500">No results.</p>;
    }

    return (
        <div className="max-h-96 space-y-4 overflow-y-auto">
            {groups.map((group) => {
                const viewerHref =
                    group.source === "docs" ? undefined : VIEWER_HREF[group.source];
                return (
                    <div key={group.source}>
                        <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                            {SOURCE_LABELS[group.source]} ({group.total})
                        </div>
                        <div className="mt-1.5 space-y-1">
                            {group.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onNavigate}
                                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 font-mono text-xs text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-accent"
                                >
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                    {item.sublabel && (
                                        <span className="shrink-0 text-zinc-600">
                                            {item.sublabel}
                                        </span>
                                    )}
                                </Link>
                            ))}
                            {viewerHref &&
                                group.total > group.items.length &&
                                (group.source === viewerId ? (
                                    <button
                                        type="button"
                                        onClick={() => onLocalQuery(text)}
                                        className="block w-full px-2 py-1 text-left font-mono text-xs text-accent/80 hover:text-accent"
                                    >
                                        {group.total - group.items.length} more in{" "}
                                        {SOURCE_LABELS[group.source]} &rarr;
                                    </button>
                                ) : (
                                    <Link
                                        href={`${viewerHref}/${gameId}?q=${encodeURIComponent(text)}`}
                                        onClick={onNavigate}
                                        className="block px-2 py-1 font-mono text-xs text-accent/80 hover:text-accent"
                                    >
                                        {group.total - group.items.length} more in{" "}
                                        {SOURCE_LABELS[group.source]} &rarr;
                                    </Link>
                                ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
