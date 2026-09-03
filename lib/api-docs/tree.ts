import type { ApiBranch, ApiCategory, ApiDump, ApiType, ApiTypeKind } from "@/lib/api-docs/types";

export const API_BRANCHES: readonly ApiBranch[] = ["stable", "beta"];

export function isApiBranch(value: string | undefined): value is ApiBranch {
    return value === "stable" || value === "beta";
}

export function apiDocsPrefix(branch: ApiBranch): string {
    return `/api-docs/${branch}`;
}

export function apiDocsHref(branch: ApiBranch, ...segments: string[]): string {
    return [apiDocsPrefix(branch), ...segments.filter(Boolean)].join("/");
}

export type ParsedBranchSlug = {
    branch: ApiBranch;
    rest: string[];
    // true when the URL had no explicit branch segment (legacy `/api-docs/...`)
    legacy: boolean;
};

export function parseBranchSlug(slug: string[] | undefined): ParsedBranchSlug {
    const parts = slug ?? [];
    if (isApiBranch(parts[0])) {
        return { branch: parts[0], rest: parts.slice(1), legacy: false };
    }
    return { branch: "stable", rest: parts, legacy: true };
}

export function slugify(name: string): string {
    const withoutGenericMarker = name.replace(/`(\d+)/g, "-$1");
    return withoutGenericMarker
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export type ApiNavType = { slug: string; name: string; kind: ApiTypeKind };
export type ApiNavCategory = { slug: string; name: string; types: ApiNavType[] };

export function buildNavTree(dump: ApiDump): ApiNavCategory[] {
    return dump.categories.map((category) => ({
        slug: slugify(category.category),
        name: category.category,
        types: category.types.map((type) => ({
            slug: slugify(type.name),
            name: type.name,
            kind: type.type,
        })),
    }));
}

export function findType(
    dump: ApiDump,
    categorySlug: string,
    typeSlug: string,
): { category: ApiCategory; type: ApiType } | null {
    for (const category of dump.categories) {
        if (slugify(category.category) !== categorySlug) continue;
        for (const type of category.types) {
            if (slugify(type.name) === typeSlug) {
                return { category, type };
            }
        }
    }
    return null;
}

export type UidIndexEntry = { categorySlug: string; typeSlug: string; type: ApiType };

export function buildUidIndex(dump: ApiDump): Map<string, UidIndexEntry> {
    const index = new Map<string, UidIndexEntry>();
    for (const category of dump.categories) {
        const categorySlug = slugify(category.category);
        for (const type of category.types) {
            index.set(type.uid, { categorySlug, typeSlug: slugify(type.name), type });
        }
    }
    return index;
}

export type FlatEntry = { categorySlug: string; typeSlug: string; label: string };

export function buildFlatSequence(dump: ApiDump): FlatEntry[] {
    const result: FlatEntry[] = [];
    for (const category of dump.categories) {
        const categorySlug = slugify(category.category);
        for (const type of category.types) {
            result.push({ categorySlug, typeSlug: slugify(type.name), label: type.name });
        }
    }
    return result;
}
