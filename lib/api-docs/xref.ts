import type { UidIndexEntry } from "@/lib/api-docs/tree";
import { resolveSchemaLink, type SchemaProjectIndex } from "@/lib/api-docs/schema-links";

export type InlineToken =
    | { kind: "text"; value: string }
    | {
          kind: "ref";
          label: string;
          categorySlug: string | null;
          typeSlug: string | null;
          schemaHref: string | null;
      };

const XREF_PATTERN = /<xref href="([^"]+)"[^>]*>([^<]*)<\/xref>/g;

function cleanInlineText(text: string): string {
    return text
        .replace(/<[^>]+>/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ");
}

export function stripMarkup(text: string): string {
    return cleanInlineText(text).trim();
}

export function parseInlineMarkup(
    text: string,
    uidIndex: Map<string, UidIndexEntry>,
    schemaIndex: SchemaProjectIndex,
): InlineToken[] {
    const tokens: InlineToken[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    XREF_PATTERN.lastIndex = 0;
    while ((match = XREF_PATTERN.exec(text)) !== null) {
        if (match.index > lastIndex) {
            tokens.push({ kind: "text", value: text.slice(lastIndex, match.index) });
        }
        const [, href, inner] = match;
        const entry = uidIndex.get(href);
        const label = inner || href.split(".").pop() || href;
        tokens.push({
            kind: "ref",
            label,
            categorySlug: entry?.categorySlug ?? null,
            typeSlug: entry?.typeSlug ?? null,
            schemaHref: entry ? null : resolveSchemaLink(schemaIndex, href),
        });
        lastIndex = XREF_PATTERN.lastIndex;
    }
    if (lastIndex < text.length) {
        tokens.push({ kind: "text", value: text.slice(lastIndex) });
    }
    if (tokens.length === 0) {
        tokens.push({ kind: "text", value: text });
    }

    const cleaned: InlineToken[] = tokens.map((token) =>
        token.kind === "text" ? { kind: "text", value: cleanInlineText(token.value) } : token,
    );

    const head = cleaned[0];
    if (head?.kind === "text") {
        head.value = head.value.replace(/^\s+/, "");
    }
    const tail = cleaned[cleaned.length - 1];
    if (tail?.kind === "text") {
        tail.value = tail.value.replace(/\s+$/, "");
    }

    return cleaned.filter((token) => token.kind !== "text" || token.value !== "");
}
