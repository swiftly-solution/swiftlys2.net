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

export async function getDocsMeta(ref: string = LATEST_REF): Promise<DocsMeta> {
    return getCachedGithubDump<DocsMeta>({
        key: `docs-meta:${ref}`,
        commit: docsCommit(ref),
        load: async () => {
            const res = await fetch(fileUrl(`${DOCS_PATH}/_meta.json`, ref), {
                cache: "no-store",
            });
            if (!res.ok) {
                throw new Error(`Docs meta fetch failed: ${res.status}`);
            }
            return (await res.json()) as DocsMeta;
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
