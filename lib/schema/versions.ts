import { githubHeaders } from "@/lib/github";
import type { Game } from "@/lib/schema/games";

export type Version = {
    sha: string;
    buildId: string | null;
    patchVersion: string | null;
    filesModified: number | null;
    buildDate: string | null;
    commitDate: string;
    message: string;
};

const VERSION_PATTERN = /^(\d+) - ([\d.]+) \| (\d+) modified \| (.+)$/;

const REVALIDATE_MS = 60 * 1000;

type CacheEntry = { versions: Version[]; fetchedAt: number };
const cache = new Map<string, CacheEntry>();

export async function getVersions(
    game: Game,
    path: string,
): Promise<Version[]> {
    const cacheKey = `${game.id}:${path}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < REVALIDATE_MS) {
        return cached.versions;
    }

    try {
        const url = `https://api.github.com/repos/${game.repoOwner}/${game.repoName}/commits?path=${encodeURIComponent(path)}&per_page=100`;
        const res = await fetch(url, { headers: githubHeaders() });
        if (!res.ok) {
            throw new Error(`Version history fetch failed: ${res.status}`);
        }
        const commits = (await res.json()) as Array<Record<string, unknown>>;
        const versions: Version[] = commits.map((c) => {
            const commit = c.commit as Record<string, unknown>;
            const author = commit.author as Record<string, unknown>;
            const message = commit.message as string;
            const match = message.match(VERSION_PATTERN);
            return {
                sha: c.sha as string,
                buildId: match?.[1] ?? null,
                patchVersion: match?.[2] ?? null,
                filesModified: match ? Number(match[3]) : null,
                buildDate: match?.[4] ?? null,
                commitDate: author.date as string,
                message,
            };
        });
        cache.set(cacheKey, { versions, fetchedAt: Date.now() });
        return versions;
    } catch (error) {
        if (cached) return cached.versions;
        throw error;
    }
}
