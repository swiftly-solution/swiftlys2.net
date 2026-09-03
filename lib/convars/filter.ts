export type TriState = "include" | "exclude";
export type FilterFacet = Record<string, TriState>;
export type FacetKey = "modules" | "flags" | "attrs";

export type Filters = {
    modules: FilterFacet;
    flags: FilterFacet;
    attrs: FilterFacet;
};

export const EMPTY_FILTERS: Filters = { modules: {}, flags: {}, attrs: {} };

export const ATTR_KEYS = [
    "has_callback",
    "has_default",
    "has_min",
    "has_max",
    "has_completion_callback",
] as const;

export const ATTR_LABELS: Record<string, string> = {
    has_callback: "callback",
    has_default: "default",
    has_min: "min",
    has_max: "max",
    has_completion_callback: "completion callback",
};

export type FilterableItem = {
    module: string;
    flags: string[];
    attrs: string[];
};

export function attrKeysOf(attributes: Record<string, boolean>): string[] {
    return Object.entries(attributes)
        .filter(([, value]) => value)
        .map(([key]) => key);
}

function partition(facet: FilterFacet): { include: string[]; exclude: string[] } {
    const include: string[] = [];
    const exclude: string[] = [];
    for (const [key, state] of Object.entries(facet)) {
        if (state === "include") include.push(key);
        else if (state === "exclude") exclude.push(key);
    }
    return { include, exclude };
}

export function matchesFilters(item: FilterableItem, filters: Filters): boolean {
    const mod = partition(filters.modules);
    if (mod.include.length > 0 && !mod.include.includes(item.module)) return false;
    if (mod.exclude.includes(item.module)) return false;

    const flags = partition(filters.flags);
    if (flags.include.some((f) => !item.flags.includes(f))) return false;
    if (flags.exclude.some((f) => item.flags.includes(f))) return false;

    const attrs = partition(filters.attrs);
    if (attrs.include.some((a) => !item.attrs.includes(a))) return false;
    if (attrs.exclude.some((a) => item.attrs.includes(a))) return false;

    return true;
}

export function countActiveFilters(filters: Filters): number {
    return (
        Object.keys(filters.modules).length +
        Object.keys(filters.flags).length +
        Object.keys(filters.attrs).length
    );
}

export function cycleTriState(current: TriState | undefined): TriState | undefined {
    if (current === undefined) return "include";
    if (current === "include") return "exclude";
    return undefined;
}
