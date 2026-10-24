import { githubFetch, REPO_URL, type ReleaseAsset } from "@/lib/github";

const PER_PAGE = 100;
const MAX_PAGES = 5;
const MAX_COMPARES = 64;

export type FullRelease = {
    tag: string;
    publishedAt: string | null;
    url: string;
    prerelease: boolean;
    assets: ReleaseAsset[];
};

let cachedReleases: FullRelease[] = [];

export async function getAllReleases(): Promise<FullRelease[]> {
    try {
        const releases: FullRelease[] = [];
        for (let page = 1; page <= MAX_PAGES; page++) {
            const data = (await githubFetch(
                `/releases?per_page=${PER_PAGE}&page=${page}`,
            )) as Array<Record<string, unknown>>;
            for (const release of data) {
                if (release.draft) continue;
                releases.push({
                    tag: release.tag_name as string,
                    publishedAt: (release.published_at as string) ?? null,
                    url: (release.html_url as string) ?? REPO_URL,
                    prerelease: Boolean(release.prerelease),
                    assets: (
                        release.assets as Array<Record<string, unknown>>
                    ).map((asset) => ({
                        name: asset.name as string,
                        url: asset.browser_download_url as string,
                    })),
                });
            }
            if (data.length < PER_PAGE) break;
        }
        releases.sort((a, b) =>
            (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
        );
        cachedReleases = releases;
        return releases;
    } catch {
        return cachedReleases;
    }
}

export function previousStable(
    releases: FullRelease[],
    tag: string,
): FullRelease | undefined {
    const i = releases.findIndex((r) => r.tag === tag);
    return releases.slice(i + 1).find((r) => !r.prerelease);
}

export function diffBase(
    releases: FullRelease[],
    release: FullRelease,
): FullRelease | undefined {
    return release.prerelease
        ? releases[releases.findIndex((r) => r.tag === release.tag) + 1]
        : previousStable(releases, release.tag);
}

export function cycleBetas(
    releases: FullRelease[],
    stable: FullRelease,
): FullRelease[] {
    const i = releases.findIndex((r) => r.tag === stable.tag);
    const rest = releases.slice(i + 1);
    const end = rest.findIndex((r) => !r.prerelease);
    return (end === -1 ? rest : rest.slice(0, end)).filter((r) => r.prerelease);
}

export type Commit = {
    sha: string;
    url: string;
    author: string | null;
    message: string;
};

export type Changes = {
    commits: Commit[];
    total: number;
    compareUrl: string;
};

type RawCommit = {
    sha: string;
    html_url: string;
    author: { login: string } | null;
    commit: { message: string };
};

const compareCache = new Map<string, Changes>();

export async function getChanges(
    base: string,
    head: string,
): Promise<Changes | null> {
    const key = `${base}...${head}`;
    const hit = compareCache.get(key);
    if (hit) {
        compareCache.delete(key);
        compareCache.set(key, hit);
        return hit;
    }
    try {
        const data = (await githubFetch(
            `/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`,
        )) as Record<string, unknown>;
        const changes: Changes = {
            commits: (data.commits as RawCommit[])
                .map((c) => ({
                    sha: c.sha,
                    url: c.html_url,
                    author: c.author?.login ?? null,
                    message: c.commit.message.split("\n")[0],
                }))
                .reverse(),
            total: data.total_commits as number,
            compareUrl:
                (data.html_url as string) ??
                `${REPO_URL}/compare/${base}...${head}`,
        };
        compareCache.set(key, changes);
        if (compareCache.size > MAX_COMPARES) {
            compareCache.delete(compareCache.keys().next().value as string);
        }
        return changes;
    } catch {
        return null;
    }
}

export type GroupId = "breaking" | "feat" | "fix" | "docs" | "other";

export const GROUPS: { id: GroupId; label: string; open: boolean }[] = [
    { id: "breaking", label: "Breaking", open: true },
    { id: "feat", label: "Features", open: true },
    { id: "fix", label: "Fixes", open: true },
    { id: "docs", label: "Docs", open: false },
    { id: "other", label: "Other", open: false },
];

export type ParsedCommit = Commit & {
    group: GroupId;
    scope: string | null;
    title: string;
};

const CONVENTIONAL = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/;

export function parseCommit(commit: Commit): ParsedCommit {
    const m = CONVENTIONAL.exec(commit.message);
    if (!m) {
        return {
            ...commit,
            group: "other",
            scope: null,
            title: commit.message,
        };
    }
    const [, type, scope, bang, title] = m;
    const group: GroupId = bang
        ? "breaking"
        : type === "feat"
          ? "feat"
          : type === "fix"
            ? "fix"
            : type === "docs"
              ? "docs"
              : "other";
    return { ...commit, group, scope: scope ?? null, title };
}

export function groupChanges(commits: Commit[]) {
    const parsed = commits
        .filter((c) => !c.message.startsWith("Merge "))
        .map(parseCommit);
    return GROUPS.map((g) => ({
        ...g,
        commits: parsed.filter((c) => c.group === g.id),
    })).filter((g) => g.commits.length > 0);
}
