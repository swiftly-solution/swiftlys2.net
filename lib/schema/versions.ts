import { githubHeaders } from "@/lib/github";
import { getCachedGithubDump, LATEST_REF } from "@/lib/github-cache";
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

const MAX_PAGES = 10;

export async function getVersions(
    game: Game,
    path: string,
    options?: { since?: string },
): Promise<Version[]> {
    return getCachedGithubDump<Version[]>({
        key: `versions:${game.id}:${path}`,
        commit: {
            owner: game.repoOwner,
            repo: game.repoName,
            ref: LATEST_REF,
            path,
        },
        load: async () => {
            const versions: Version[] = [];
            let page = 1;
            let foundSince = false;

            while (page <= MAX_PAGES) {
                const url = `https://api.github.com/repos/${game.repoOwner}/${game.repoName}/commits?path=${encodeURIComponent(path)}&per_page=100&page=${page}`;
                const res = await fetch(url, {
                    headers: githubHeaders(),
                    cache: "no-store",
                });
                if (!res.ok) {
                    throw new Error(`Version history fetch failed: ${res.status}`);
                }
                const commits = (await res.json()) as Array<
                    Record<string, unknown>
                >;
                if (commits.length === 0) break;

                for (const c of commits) {
                    const sha = c.sha as string;
                    const commit = c.commit as Record<string, unknown>;
                    const author = commit.author as Record<string, unknown>;
                    const message = commit.message as string;
                    const match = message.match(VERSION_PATTERN);
                    versions.push({
                        sha,
                        buildId: match?.[1] ?? null,
                        patchVersion: match?.[2] ?? null,
                        filesModified: match ? Number(match[3]) : null,
                        buildDate: match?.[4] ?? null,
                        commitDate: author.date as string,
                        message,
                    });
                    if (options?.since && sha === options.since) {
                        foundSince = true;
                        break;
                    }
                }

                if (foundSince || commits.length < 100) break;
                page += 1;
            }

            if (options?.since) {
                const cutoff = versions.findIndex((v) => v.sha === options.since);
                if (cutoff !== -1) return versions.slice(0, cutoff + 1);
            }

            return versions;
        },
    });
}
