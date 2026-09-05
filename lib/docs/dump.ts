import { DOCS_PATH, DOCS_REPO_NAME, DOCS_REPO_OWNER } from "@/lib/docs/config";
import { getCachedGithubDump, LATEST_REF } from "@/lib/github-cache";
import type { DocsMeta } from "@/lib/docs/types";

function fileUrl(path: string, ref: string): string {
    return `https://raw.githubusercontent.com/${DOCS_REPO_OWNER}/${DOCS_REPO_NAME}/${ref}/${path}`;
}

function docsCommit(ref: string) {
    return {
        owner: DOCS_REPO_OWNER,
        repo: DOCS_REPO_NAME,
        ref,
        path: DOCS_PATH,
    };
}

function metaPath(dir: string): string {
    const base = dir ? `${DOCS_PATH}/${dir}` : DOCS_PATH;
    return `${base}/_meta.json`;
}

async function fetchMeta(dir: string, ref: string): Promise<DocsMeta> {
    const res = await fetch(fileUrl(metaPath(dir), ref), { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Docs meta fetch failed: ${res.status}`);
    }
    return (await res.json()) as DocsMeta;
}

// Resolves `category` entries (which point at a subdirectory with its own
// _meta.json) into inline `children`, prefixing nested page paths with the
// subdirectory so getDocPageSource can still fetch them from DOCS_PATH.
async function resolveCategories(
    meta: DocsMeta,
    ref: string,
    dir = "",
): Promise<DocsMeta> {
    const entries = await Promise.all(
        Object.entries(meta).map(async ([key, entry]) => {
            if (entry.category) {
                const categoryDir = dir
                    ? `${dir}/${entry.category}`
                    : entry.category;
                const childMeta = await fetchMeta(categoryDir, ref);
                const children = await resolveCategories(
                    childMeta,
                    ref,
                    categoryDir,
                );
                return [key, { title: entry.title, children }] as const;
            }
            if (entry.children) {
                const children = await resolveCategories(
                    entry.children,
                    ref,
                    dir,
                );
                return [key, { title: entry.title, children }] as const;
            }
            if (entry.page) {
                const page = dir ? `${dir}/${entry.page}` : entry.page;
                return [key, { title: entry.title, page }] as const;
            }
            return [key, entry] as const;
        }),
    );
    return Object.fromEntries(entries);
}

export async function getDocsMeta(ref: string = LATEST_REF): Promise<DocsMeta> {
    return getCachedGithubDump<DocsMeta>({
        key: `docs-meta:${ref}`,
        commit: docsCommit(ref),
        load: async () => {
            const root = await fetchMeta("", ref);
            return resolveCategories(root, ref);
        },
    });
}

export async function getDocPageSource(
    filename: string,
    ref: string = LATEST_REF,
): Promise<string> {
    return getCachedGithubDump<string>({
        key: `docs-page:${ref}:${filename}`,
        commit: docsCommit(ref),
        load: async () => {
            const res = await fetch(fileUrl(`${DOCS_PATH}/${filename}`, ref), {
                cache: "no-store",
            });
            if (!res.ok) {
                throw new Error(`Docs page fetch failed: ${res.status}`);
            }
            return res.text();
        },
    });
}
