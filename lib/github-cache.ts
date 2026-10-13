import { githubHeaders } from "@/lib/github";

const COMMIT_TTL_MS = 60 * 1000;
const MAX_STALE_MS = 10 * 60 * 1000;

export const LATEST_REF = "main";

export type CommitTarget = {
    owner: string;
    repo: string;
    ref: string;
    path?: string;
};

type ShaEntry = { sha: string; at: number };
const shaCache = new Map<string, ShaEntry>();

export async function getLatestCommitSha(
    target: CommitTarget,
): Promise<string | null> {
    const key = `${target.owner}/${target.repo}@${target.ref}:${target.path ?? ""}`;
    const hit = shaCache.get(key);
    if (hit && Date.now() - hit.at < COMMIT_TTL_MS) {
        return hit.sha;
    }

    try {
        const params = new URLSearchParams({
            sha: target.ref,
            per_page: "1",
        });
        if (target.path) params.set("path", target.path);

        const res = await fetch(
            `https://api.github.com/repos/${target.owner}/${target.repo}/commits?${params}`,
            { headers: githubHeaders(), cache: "no-store" },
        );
        if (!res.ok) {
            throw new Error(`commits ${res.status}`);
        }
        const rows = (await res.json()) as Array<{ sha?: string }>;
        const sha = rows[0]?.sha ?? null;
        if (sha) {
            shaCache.set(key, { sha, at: Date.now() });
        }
        return sha ?? hit?.sha ?? null;
    } catch {
        return hit?.sha ?? null;
    }
}

type DumpEntry<T> = { value: T; sha: string | null; storedAt: number };
const dumpCache = new Map<string, DumpEntry<unknown>>();

export type CachedDumpOptions<T> = {
    key: string;
    commit: CommitTarget;
    load: () => Promise<T>;
    latestRef?: string;
};

const MAX_HISTORICAL_DUMPS = 8;
const historicalCache = new Map<string, unknown>();

const inflight = new Map<string, Promise<unknown>>();

export function getCachedGithubDump<T>(opts: CachedDumpOptions<T>): Promise<T> {
    const pending = inflight.get(opts.key) as Promise<T> | undefined;
    if (pending) return pending;
    const p = loadCachedGithubDump(opts).finally(() =>
        inflight.delete(opts.key),
    );
    inflight.set(opts.key, p);
    return p;
}

async function loadCachedGithubDump<T>(opts: CachedDumpOptions<T>): Promise<T> {
    const latestRef = opts.latestRef ?? LATEST_REF;
    const isLatest = opts.commit.ref === latestRef;

    if (!isLatest) {
        const cached = historicalCache.get(opts.key) as T | undefined;
        if (cached !== undefined) {
            historicalCache.delete(opts.key);
            historicalCache.set(opts.key, cached);
            return cached;
        }
        const value = await opts.load();
        historicalCache.set(opts.key, value);
        if (historicalCache.size > MAX_HISTORICAL_DUMPS) {
            historicalCache.delete(
                historicalCache.keys().next().value as string,
            );
        }
        return value;
    }

    const entry = dumpCache.get(opts.key) as DumpEntry<T> | undefined;

    if (entry && Date.now() - entry.storedAt < MAX_STALE_MS) {
        const sha = await getLatestCommitSha(opts.commit);
        if (sha === null || sha === entry.sha) {
            return entry.value;
        }
    }

    try {
        const value = await opts.load();
        const sha = await getLatestCommitSha(opts.commit);
        dumpCache.set(opts.key, { value, sha, storedAt: Date.now() });
        return value;
    } catch (error) {
        if (entry) {
            return entry.value;
        }
        throw error;
    }
}
