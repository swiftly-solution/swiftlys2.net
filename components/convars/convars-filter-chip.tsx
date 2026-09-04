"use client";

import { useConvarsFilters } from "@/components/convars/filter-context";
import type { FacetKey } from "@/lib/convars/filter";

export function ConvarsFilterChip({
    facet,
    value,
    label,
}: {
    facet: FacetKey;
    value: string;
    label: string;
}) {
    const { filters, cycle } = useConvarsFilters();
    const state = filters[facet][value];

    const tone =
        state === "include"
            ? "border-accent/50 bg-accent/10 text-accent"
            : state === "exclude"
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-white/10 text-zinc-300 hover:border-white/25 hover:text-white";
    const prefix = state === "include" ? "+ " : state === "exclude" ? "− " : "";

    return (
        <button
            type="button"
            onClick={() => cycle(facet, value)}
            aria-pressed={state !== undefined}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${tone}`}
        >
            {prefix}
            {label}
        </button>
    );
}
