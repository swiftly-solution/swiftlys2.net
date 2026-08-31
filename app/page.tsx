import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { StatsBar } from "@/components/stats-bar";
import { LanguageBreakdown } from "@/components/language-breakdown";
import { WhySwiftly } from "@/components/why-swiftly";
import { CapabilityGrid } from "@/components/capability-grid";
import { RecentReleases } from "@/components/recent-releases";
import { TopCreators } from "@/components/top-creators";
import { Faq } from "@/components/faq";
import { DeveloperCta } from "@/components/developer-cta";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import {
    getRepoStats,
    getLanguageBreakdown,
    getRecentReleases,
    getLatestStableRelease,
    getTopContributors,
    timeAgo,
    type Release,
} from "@/lib/github";

export default async function Home() {
    const [stats, languages, releases, latestStableRelease, contributors] =
        await Promise.all([
            getRepoStats(),
            getLanguageBreakdown(),
            getRecentReleases(20),
            getLatestStableRelease(),
            getTopContributors(),
        ]);

    const latestBeta =
        releases.find((r) => r.prerelease)?.tag ?? releases[0]?.tag ?? null;
    const recentBetas = releases.filter((r) => r.prerelease).slice(0, 5);
    const releaseFeed = [latestStableRelease, ...recentBetas].filter(
        (release): release is Release => release !== null,
    );

    return (
        <div className="flex flex-1 flex-col bg-background">
            <SiteHeader />
            <main className="flex-1">
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
            </main>
            <SiteFooter />
        </div>
    );
}
