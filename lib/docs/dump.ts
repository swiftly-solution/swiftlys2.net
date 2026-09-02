import { DOCS_PATH, DOCS_REPO_NAME, DOCS_REPO_OWNER } from "@/lib/docs/config";
import type { DocsMeta } from "@/lib/docs/types";

const REVALIDATE_MS = 60 * 1000;
const LATEST_REF = "main";

function fileUrl(path: string, ref: string): string {
    return `https://raw.githubusercontent.com/${DOCS_REPO_OWNER}/${DOCS_REPO_NAME}/${ref}/${path}`;
}

type MetaCacheEntry = { meta: DocsMeta; fetchedAt: number };
const metaCache = new Map<string, MetaCacheEntry>();

export async function getDocsMeta(ref: string = LATEST_REF): Promise<DocsMeta> {
    const cached = metaCache.get(ref);
    const isLatest = ref === LATEST_REF;
    if (
        cached &&
        (!isLatest || Date.now() - cached.fetchedAt < REVALIDATE_MS)
    ) {
        return cached.meta;
    }

    try {
        const res = await fetch(fileUrl(`${DOCS_PATH}/_meta.json`, ref));
        if (!res.ok) {
            throw new Error(`Docs meta fetch failed: ${res.status}`);
        }
        const meta = (await res.json()) as DocsMeta;
        metaCache.set(ref, { meta, fetchedAt: Date.now() });
        return meta;
    } catch (error) {
        if (cached) return cached.meta;
        throw error;
    }
}

type PageCacheEntry = { content: string; fetchedAt: number };
const pageCache = new Map<string, PageCacheEntry>();

export async function getDocPageSource(
    filename: string,
    ref: string = LATEST_REF,
): Promise<string> {
    const cacheKey = `${ref}:${filename}`;
    const cached = pageCache.get(cacheKey);
    const isLatest = ref === LATEST_REF;
    if (
        cached &&
        (!isLatest || Date.now() - cached.fetchedAt < REVALIDATE_MS)
    ) {
        return cached.content;
    }

    try {
        const res = await fetch(fileUrl(`${DOCS_PATH}/${filename}`, ref));
        if (!res.ok) {
            throw new Error(`Docs page fetch failed: ${res.status}`);
        }
        const content = await res.text();
        pageCache.set(cacheKey, { content, fetchedAt: Date.now() });
        return content;
    } catch (error) {
        if (cached) return cached.content;
        throw error;
    }
}
