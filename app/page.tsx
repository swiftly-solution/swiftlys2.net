import { Hero } from "@/components/hero";
import { StatsBar } from "@/components/stats-bar";
import { LanguageBreakdown } from "@/components/language-breakdown";
import { WhySwiftly } from "@/components/why-swiftly";
import { CapabilityGrid } from "@/components/capability-grid";
import { RecentReleases } from "@/components/recent-releases";
import { TopCreators } from "@/components/top-creators";
import { Faq } from "@/components/faq";
import { DeveloperCta } from "@/components/developer-cta";
import { Reveal } from "@/components/reveal";
import { getBaseUrl } from "@/lib/base-url";
import {
    timeAgo,
    type Contributor,
    type LanguageShare,
    type Release,
    type RepoStats,
} from "@/lib/github";

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
    try {
        const res = await fetch(url);
        if (!res.ok) return fallback;
        return (await res.json()) as T;
    } catch {
        return fallback;
    }
}

export default async function Home() {
    const baseUrl = await getBaseUrl();

    const [stats, languages, releases, latestStableRelease, contributors] =
        await Promise.all([
            fetchJson<RepoStats>(`${baseUrl}/api/github/stats`, {
                stars: 0,
                forks: 0,
                openIssues: 0,
                pushedAt: null,
                url: "",
            }),
            fetchJson<LanguageShare[]>(`${baseUrl}/api/github/languages`, []),
            fetchJson<Release[]>(`${baseUrl}/api/github/releases?limit=20`, []),
            fetchJson<Release | null>(
                `${baseUrl}/api/github/latest-stable`,
                null,
            ),
            fetchJson<Contributor[]>(`${baseUrl}/api/github/contributors`, []),
        ]);

    const latestBeta =
        releases.find((r) => r.prerelease)?.tag ?? releases[0]?.tag ?? null;
    const recentBetas = releases.filter((r) => r.prerelease).slice(0, 5);
    const releaseFeed = [latestStableRelease, ...recentBetas].filter(
        (release): release is Release => release !== null,
    );

    return (
        <>
            <Hero
                latestBeta={latestBeta}
                latestStable={latestStableRelease?.tag ?? null}
            />
            <Reveal>
                <StatsBar
                    stars={stats.stars}
                    forks={stats.forks}
                    openIssues={stats.openIssues}
                    lastPush={timeAgo(stats.pushedAt)}
                />
            </Reveal>
            <Reveal delay={80}>
                <LanguageBreakdown languages={languages} />
            </Reveal>
            <Reveal>
                <WhySwiftly />
            </Reveal>
            <Reveal>
                <CapabilityGrid />
            </Reveal>
            <Reveal>
                <RecentReleases releases={releaseFeed} />
            </Reveal>
            <Reveal>
                <TopCreators contributors={contributors} />
            </Reveal>
            <Reveal>
                <Faq />
            </Reveal>
            <Reveal>
                <DeveloperCta />
            </Reveal>
        </>
    );
}
