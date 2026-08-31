import Link from "next/link";
import { formatTimestamp, timeAgo, REPO_URL, type Release } from "@/lib/github";

export function RecentReleases({ releases }: { releases: Release[] }) {
    if (releases.length === 0) return null;

    const path = REPO_URL.replace("https://github.com/", "");

    return (
        <section id="releases" className="mx-auto mt-16 max-w-6xl px-6">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950 font-mono text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-3 text-xs text-zinc-500">
                    <span className="break-all">
                        <span className="text-zinc-600">$</span> tail -f {path}
                        /releases
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-accent">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                        </span>
                        streaming
                    </span>
                </div>

                <div className="divide-y divide-white/5">
                    {releases.map((release) => (
                        <Link
                            key={release.tag}
                            href={release.url}
                            className="flex flex-wrap items-center gap-3 px-5 py-3 text-xs transition-colors hover:bg-white/[0.03] sm:text-sm"
                        >
                            <span className="text-zinc-600">
                                {formatTimestamp(release.publishedAt)}
                            </span>
                            <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                    release.prerelease
                                        ? "bg-accent/10 text-accent"
                                        : "bg-amber-400/10 text-amber-400"
                                }`}
                            >
                                {release.prerelease ? "beta" : "stable"}
                            </span>
                            <span className="font-medium text-white">
                                {release.tag}
                            </span>
                            <span className="flex-1 text-zinc-500">
                                Release {release.tag}
                            </span>
                            <span className="text-zinc-600">
                                {timeAgo(release.publishedAt)}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
