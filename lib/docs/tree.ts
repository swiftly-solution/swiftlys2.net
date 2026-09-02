import type { DocsMeta } from "@/lib/docs/types";

export type DocsPageRef = { slug: string; page: string };

export function flattenDocsMeta(meta: DocsMeta, prefix = ""): DocsPageRef[] {
    const result: DocsPageRef[] = [];
    for (const [key, entry] of Object.entries(meta)) {
        const slug = prefix ? `${prefix}/${key}` : key;
        if (entry.page) {
            result.push({ slug, page: entry.page });
        }
        if (entry.children) {
            result.push(...flattenDocsMeta(entry.children, slug));
        }
    }
    return result;
}

export function findDocPage(
    meta: DocsMeta,
    slugParts: string[],
): DocsPageRef | null {
    let current = meta;
    let path = "";

    for (let i = 0; i < slugParts.length; i++) {
        const key = slugParts[i];
        path = path ? `${path}/${key}` : key;
        const entry = current[key];
        if (!entry) return null;

        if (i === slugParts.length - 1) {
            return entry.page ? { slug: path, page: entry.page } : null;
        }
        if (!entry.children) return null;
        current = entry.children;
    }

    return null;
}
