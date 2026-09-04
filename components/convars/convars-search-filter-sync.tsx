"use client";

import { useEffect, useRef } from "react";
import { useConvarsFilters } from "@/components/convars/filter-context";
import { parseSearchQuery } from "@/lib/search/query";
import { useViewerSearch } from "@/components/search/viewer-search-context";
import type { FacetKey } from "@/lib/convars/filter";

const FACET_KEY_OF: Record<string, FacetKey> = {
    flag: "flags",
    attr: "attrs",
    module: "modules",
};

export function ConvarsSearchFilterSync() {
    const { query } = useViewerSearch();
    const { setKind, setFacetState } = useConvarsFilters();

    const tokenFacets = useRef<Map<string, { facet: FacetKey; value: string }>>(
        new Map(),
    );
    const tokenKind = useRef<"convar" | "concommand" | null>(null);

    useEffect(() => {
        const { tokens } = parseSearchQuery(query);

        const kindToken = tokens.find((t) => t.key === "kind")?.value;
        const nextKind =
            kindToken === "convar" || kindToken === "concommand"
                ? kindToken
                : null;
        if (nextKind !== tokenKind.current) {
            if (nextKind) setKind(nextKind);
            else if (tokenKind.current) setKind("all");
            tokenKind.current = nextKind;
        }

        const nextFacets = new Map<string, { facet: FacetKey; value: string }>();
        for (const t of tokens) {
            const facet = FACET_KEY_OF[t.key];
            if (!facet) continue;
            const key = `${facet}:${t.value}`;
            nextFacets.set(key, { facet, value: t.value });
            if (!tokenFacets.current.has(key)) {
                setFacetState(facet, t.value, "include");
            }
        }
        for (const [key, entry] of tokenFacets.current) {
            if (!nextFacets.has(key)) {
                setFacetState(entry.facet, entry.value, undefined);
            }
        }
        tokenFacets.current = nextFacets;
    }, [query, setKind, setFacetState]);

    return null;
}
