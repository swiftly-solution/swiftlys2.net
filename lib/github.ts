const OWNER = "swiftly-solution";
const REPO = "swiftlys2";
const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;
const REVALIDATE_SECONDS = 60;

export function githubHeaders() {
    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
    };
    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
}

async function githubFetch(path: string) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: githubHeaders(),
        next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
        throw new Error(`GitHub API ${path} failed: ${res.status}`);
    }
    return res.json();
}

export type RepoStats = {
    stars: number;
    forks: number;
    openIssues: number;
    pushedAt: string | null;
    url: string;
};

let cachedRepoStats: RepoStats | null = null;

export async function getRepoStats(): Promise<RepoStats> {
    try {
        const data = await githubFetch("");
        const stats: RepoStats = {
            stars: data.stargazers_count ?? 0,
            forks: data.forks_count ?? 0,
            openIssues: data.open_issues_count ?? 0,
            pushedAt: data.pushed_at ?? null,
            url: data.html_url ?? REPO_URL,
        };
        cachedRepoStats = stats;
        return stats;
    } catch {
        return (
            cachedRepoStats ?? {
                stars: 0,
                forks: 0,
                openIssues: 0,
                pushedAt: null,
                url: REPO_URL,
            }
        );
    }
}

export type LanguageShare = {
    name: string;
    percent: number;
};

let cachedLanguages: LanguageShare[] | null = null;

export async function getLanguageBreakdown(): Promise<LanguageShare[]> {
    try {
        const data = (await githubFetch("/languages")) as Record<
            string,
            number
        >;
        const total = Object.values(data).reduce(
            (sum, bytes) => sum + bytes,
            0,
        );
        const languages =
            total === 0
                ? []
                : Object.entries(data)
                      .map(([name, bytes]) => ({
                          name,
                          percent: (bytes / total) * 100,
                      }))
                      .sort((a, b) => b.percent - a.percent);
        cachedLanguages = languages;
        return languages;
    } catch {
        return cachedLanguages ?? [];
    }
}

export type Release = {
    tag: string;
    publishedAt: string | null;
    url: string;
    prerelease: boolean;
};

const cachedReleases = new Map<number, Release[]>();

export async function getRecentReleases(limit = 6): Promise<Release[]> {
    try {
        const data = await githubFetch(`/releases?per_page=${limit}`);
        const releases = (data as Array<Record<string, unknown>>).map(
            (release) => ({
                tag:
                    (release.tag_name as string) ??
                    (release.name as string) ??
                    "release",
                publishedAt: (release.published_at as string) ?? null,
                url: (release.html_url as string) ?? REPO_URL,
                prerelease: Boolean(release.prerelease),
            }),
        );
        cachedReleases.set(limit, releases);
        return releases;
    } catch {
        return cachedReleases.get(limit) ?? [];
    }
}

let cachedLatestStable: Release | null = null;
let hasFetchedLatestStable = false;

export async function getLatestStableRelease(): Promise<Release | null> {
    try {
        const release = await githubFetch("/releases/latest");
        const result: Release = {
            tag:
                (release.tag_name as string) ??
                (release.name as string) ??
                "release",
            publishedAt: (release.published_at as string) ?? null,
            url: (release.html_url as string) ?? REPO_URL,
            prerelease: false,
        };
        cachedLatestStable = result;
        hasFetchedLatestStable = true;
        return result;
    } catch {
        return hasFetchedLatestStable ? cachedLatestStable : null;
    }
}

export type Contributor = {
    login: string;
    avatarUrl: string;
    contributions: number;
    url: string;
};

const cachedContributors = new Map<number, Contributor[]>();

export async function getTopContributors(limit = 8): Promise<Contributor[]> {
    try {
        const data = await githubFetch(`/contributors?per_page=${limit}`);
        const contributors = (data as Array<Record<string, unknown>>).map(
            (c) => ({
                login: c.login as string,
                avatarUrl: c.avatar_url as string,
                contributions: c.contributions as number,
                url: c.html_url as string,
            }),
        );
        cachedContributors.set(limit, contributors);
        return contributors;
    } catch {
        return cachedContributors.get(limit) ?? [];
    }
}

export function timeAgo(dateString: string | null): string {
    if (!dateString) return "-";
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function formatTimestamp(dateString: string | null): string {
    if (!dateString) return "-";
    const d = new Date(dateString);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(
        d.getUTCHours(),
    )}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

export { REPO_URL };
