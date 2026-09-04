import type { ViewerId } from "@/lib/search/filter-config";

export type SearchToken = { key: string; value: string };
export type ParsedQuery = { freeText: string; tokens: SearchToken[] };

const TOKEN_PATTERN = /([a-zA-Z]+):(?:"([^"]*)"|(\S+))/g;

export function parseSearchQuery(raw: string): ParsedQuery {
    const tokens: SearchToken[] = [];
    const freeParts: string[] = [];
    let lastIndex = 0;
    TOKEN_PATTERN.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = TOKEN_PATTERN.exec(raw)) !== null) {
        freeParts.push(raw.slice(lastIndex, match.index));
        const key = match[1].toLowerCase();
        const value = match[2] !== undefined ? match[2] : (match[3] ?? "");
        tokens.push({ key, value });
        lastIndex = TOKEN_PATTERN.lastIndex;
    }
    freeParts.push(raw.slice(lastIndex));
    const freeText = freeParts.join(" ").replace(/\s+/g, " ").trim();
    return { freeText, tokens };
}

export function tokenValue(
    tokens: SearchToken[],
    key: string,
): string | undefined {
    return tokens.find((t) => t.key === key)?.value;
}

export function stripSitePrefix(raw: string): {
    isGlobal: boolean;
    rest: string;
} {
    const trimmed = raw.trimStart();
    if (trimmed.toLowerCase().startsWith("site:")) {
        return { isGlobal: true, rest: trimmed.slice(5).trim() };
    }
    return { isGlobal: false, rest: raw };
}

export type GlobalSource = ViewerId | "docs";

export type GlobalSearchItem = {
    label: string;
    sublabel?: string;
    href: string;
};

export type GlobalSearchGroup = {
    source: GlobalSource;
    total: number;
    items: GlobalSearchItem[];
};

export type GlobalSearchResponse = { groups: GlobalSearchGroup[] };
