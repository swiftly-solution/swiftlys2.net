"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
    ATTR_KEYS,
    ATTR_LABELS,
    countActiveFilters,
    cycleTriState,
    EMPTY_FILTERS,
    type FacetKey,
    type FilterFacet,
    type Filters,
    type KindFilter,
    type TriState,
} from "@/lib/convars/filter";
import type { ConvarsFacets } from "@/lib/convars/types";

type FilterContextValue = {
    filters: Filters;
    activeCount: number;
    cycle: (facet: FacetKey, value: string) => void;
    setFacetState: (facet: FacetKey, value: string, state: TriState | undefined) => void;
    setKind: (kind: KindFilter) => void;
    reset: () => void;
    openModal: () => void;
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function useConvarsFilters(): FilterContextValue {
    const ctx = useContext(FilterContext);
    if (!ctx) {
        throw new Error("useConvarsFilters must be used within ConvarsFilterProvider");
    }
    return ctx;
}

export function ConvarsFilterProvider({
    gameId,
    children,
}: {
    gameId: string;
    children: ReactNode;
}) {
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
    const [modalOpen, setModalOpen] = useState(false);

    const cycle = useCallback((facet: FacetKey, value: string) => {
        setFilters((prev) => {
            const nextState = cycleTriState(prev[facet][value]);
            const nextFacet = { ...prev[facet] };
            if (nextState === undefined) delete nextFacet[value];
            else nextFacet[value] = nextState;
            return { ...prev, [facet]: nextFacet };
        });
    }, []);

    const setFacetState = useCallback(
        (facet: FacetKey, value: string, state: TriState | undefined) => {
            setFilters((prev) => {
                const nextFacet = { ...prev[facet] };
                if (state === undefined) delete nextFacet[value];
                else nextFacet[value] = state;
                return { ...prev, [facet]: nextFacet };
            });
        },
        [],
    );

    const setKind = useCallback((kind: KindFilter) => {
        setFilters((prev) => ({ ...prev, kind }));
    }, []);

    const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);

    const value = useMemo<FilterContextValue>(
        () => ({
            filters,
            activeCount: countActiveFilters(filters),
            cycle,
            setFacetState,
            setKind,
            reset,
            openModal: () => setModalOpen(true),
        }),
        [filters, cycle, setFacetState, setKind, reset],
    );

    return (
        <FilterContext.Provider value={value}>
            {children}
            <FilterModal
                gameId={gameId}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </FilterContext.Provider>
    );
}

const KIND_PREVIEW_LABEL: Record<KindFilter, string> = {
    all: "both",
    convar: "convars",
    concommand: "concommands",
};

function activeFacetEntries(
    facet: FilterFacet,
    labelOf: (value: string) => string = (v) => v,
): { value: string; label: string; state: TriState }[] {
    return Object.entries(facet).map(([value, state]) => ({
        value,
        label: labelOf(value),
        state,
    }));
}

export function ConvarsFilterButton() {
    const { filters, activeCount, openModal } = useConvarsFilters();
    const [hovered, setHovered] = useState(false);

    const moduleEntries = activeFacetEntries(filters.modules);
    const flagEntries = activeFacetEntries(filters.flags);
    const attrEntries = activeFacetEntries(
        filters.attrs,
        (v) => ATTR_LABELS[v] ?? v,
    );

    return (
        <div
            className="relative"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <button
                type="button"
                onClick={openModal}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
            >
                <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
                filters
                {activeCount > 0 && (
                    <span className="rounded-full bg-accent/15 px-1.5 font-mono text-xs text-accent">
                        {activeCount}
                    </span>
                )}
            </button>

            {hovered && activeCount > 0 && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 space-y-3 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur">
                    {filters.kind !== "all" && (
                        <PreviewRow
                            title="type"
                            items={[
                                { label: KIND_PREVIEW_LABEL[filters.kind], state: "include" },
                            ]}
                        />
                    )}
                    {moduleEntries.length > 0 && (
                        <PreviewRow title="module" items={moduleEntries} />
                    )}
                    {flagEntries.length > 0 && (
                        <PreviewRow title="flags" items={flagEntries} />
                    )}
                    {attrEntries.length > 0 && (
                        <PreviewRow title="attributes" items={attrEntries} />
                    )}
                </div>
            )}
        </div>
    );
}

function PreviewRow({
    title,
    items,
}: {
    title: string;
    items: { label: string; state: TriState }[];
}) {
    return (
        <div>
            <div className="font-mono text-[10px] uppercase tracking-wide text-zinc-500">
                {title}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
                {items.map((item) => (
                    <span
                        key={item.label}
                        className={`rounded-full border px-2 py-0.5 font-mono text-xs ${
                            item.state === "include"
                                ? "border-accent/40 bg-accent/10 text-accent"
                                : "border-red-500/40 bg-red-500/10 text-red-400"
                        }`}
                    >
                        {item.state === "exclude" ? "− " : ""}
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

function Chip({
    label,
    state,
    onClick,
}: {
    label: string;
    state: TriState | undefined;
    onClick: () => void;
}) {
    const tone =
        state === "include"
            ? "border-accent/50 bg-accent/10 text-accent"
            : state === "exclude"
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200";
    const prefix = state === "include" ? "+ " : state === "exclude" ? "− " : "";
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={state !== undefined}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${tone}`}
        >
            {prefix}
            {label}
        </button>
    );
}

function Section({
    title,
    hint,
    facet,
    values,
}: {
    title: string;
    hint: string;
    facet: FacetKey;
    values: { value: string; label: string }[];
}) {
    const { filters, cycle } = useConvarsFilters();
    return (
        <div className="mt-5 first:mt-0">
            <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-mono text-sm font-semibold text-white">{title}</h3>
                <span className="font-mono text-[10px] text-zinc-600">{hint}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
                {values.length === 0 ? (
                    <span className="font-mono text-xs text-zinc-600">loading…</span>
                ) : (
                    values.map((v) => (
                        <Chip
                            key={v.value}
                            label={v.label}
                            state={filters[facet][v.value]}
                            onClick={() => cycle(facet, v.value)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

const KIND_OPTIONS: { value: KindFilter; label: string }[] = [
    { value: "all", label: "both" },
    { value: "convar", label: "convars" },
    { value: "concommand", label: "concommands" },
];

function KindSection() {
    const { filters, setKind } = useConvarsFilters();
    return (
        <div className="mt-5 first:mt-0">
            <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-mono text-sm font-semibold text-white">type</h3>
                <span className="font-mono text-[10px] text-zinc-600">select one</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
                {KIND_OPTIONS.map((opt) => {
                    const active = filters.kind === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setKind(opt.value)}
                            aria-pressed={active}
                            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
                                active
                                    ? "border-accent/50 bg-accent/10 text-accent"
                                    : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-200"
                            }`}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function FilterModal({
    gameId,
    open,
    onClose,
}: {
    gameId: string;
    open: boolean;
    onClose: () => void;
}) {
    const { activeCount, reset } = useConvarsFilters();
    const [facets, setFacets] = useState<ConvarsFacets | null>(null);

    useEffect(() => {
        if (!open || facets) return;
        let cancelled = false;
        fetch(`/api/convars/facets?game=${gameId}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data: ConvarsFacets | null) => {
                if (!cancelled && data) setFacets(data);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [open, facets, gameId]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Filter convars & commands"
                className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="font-mono text-lg font-bold text-white">filters</h2>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-zinc-500">
                            <span>click a chip to cycle</span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full border border-white/20" />
                                off
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-accent" />
                                <span className="text-accent">include</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-red-400" />
                                <span className="text-red-400">exclude</span>
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="shrink-0 text-zinc-500 transition-colors hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <KindSection />

                <Section
                    title="module"
                    hint="match any included"
                    facet="modules"
                    values={(facets?.modules ?? []).map((m) => ({ value: m, label: m }))}
                />
                <Section
                    title="flags"
                    hint="match all included"
                    facet="flags"
                    values={(facets?.flags ?? []).map((f) => ({ value: f, label: f }))}
                />
                <Section
                    title="attributes"
                    hint="match all included"
                    facet="attrs"
                    values={ATTR_KEYS.map((k) => ({ value: k, label: ATTR_LABELS[k] }))}
                />

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="font-mono text-xs text-zinc-500">
                        {activeCount} active
                    </span>
                    <button
                        type="button"
                        onClick={reset}
                        disabled={activeCount === 0}
                        className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-zinc-300 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        reset
                    </button>
                </div>
            </div>
        </div>
    );
}
