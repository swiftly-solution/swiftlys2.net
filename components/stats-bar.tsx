import { CountUp } from "@/components/count-up";
import { REPO_URL } from "@/lib/github";

const STAT_STYLES = "px-8 py-6";

export function StatsBar({
    stars,
    forks,
    openIssues,
    lastPush,
}: {
    stars: number;
    forks: number;
    openIssues: number;
    lastPush: string;
}) {
    const numericStats = [
        { label: "stargazers", value: stars },
        { label: "forks", value: forks },
        { label: "open issues", value: openIssues },
    ];
    const apiPath = REPO_URL.replace(
        "https://github.com/",
        "api.github.com/repos/",
    );

    return (
        <div className="mx-auto max-w-6xl px-6">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-xs text-zinc-500">
                    <span>
                        <span className="text-zinc-600">$</span> curl {apiPath}
                    </span>
                    <span className="flex items-center gap-1.5 text-accent">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                        </span>
                        live
                    </span>
                </div>

                <div className="grid grid-cols-2 divide-y divide-white/10 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                    {numericStats.map((stat) => (
                        <div key={stat.label} className={STAT_STYLES}>
                            <div className="font-mono text-3xl font-bold text-white">
                                <CountUp value={stat.value} />
                            </div>
                            <div className="mt-1 font-mono text-xs text-zinc-500">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                    <div className={STAT_STYLES}>
                        <div className="font-mono text-3xl font-bold text-accent">
                            {lastPush}
                        </div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">
                            last push
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
