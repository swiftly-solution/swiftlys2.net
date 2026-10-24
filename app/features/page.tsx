import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GridBackdrop } from "@/components/grid-backdrop";
import {
    featureGroups,
    featureStats,
    type Feature,
} from "@/lib/features";
import { fixes } from "@/lib/fixes";
import {
    getAllReleases,
    getChanges,
    groupChanges,
    previousStable,
    type GroupId,
} from "@/lib/releases";

export const metadata: Metadata = {
    title: "Features - SwiftlyS2",
};

const GROUP_COLOR: Record<GroupId, string> = {
    breaking: "text-red-400",
    feat: "text-accent",
    fix: "text-amber-400",
    docs: "text-violet-400",
    other: "text-zinc-400",
};

async function RecentChanges() {
    const releases = await getAllReleases();
    const latest = releases.find((r) => !r.prerelease);
    const base = latest ? previousStable(releases, latest.tag) : undefined;
    const changes =
        latest && base ? await getChanges(base.tag, latest.tag) : null;
    const groups = changes
        ? groupChanges(changes.commits).filter(
              (g) => g.id === "breaking" || g.id === "feat" || g.id === "fix",
          )
        : [];

    return (
        <section id="recent" className="scroll-mt-24 space-y-4">
            <h2 className="text-2xl font-bold text-white">
                Recent <span className="text-accent">changes</span>
            </h2>
            {latest && changes && base && (
                <p className="text-sm text-zinc-400">
                    Features and fixes since {base.tag} in{" "}
                    <Link
                        href={`/releases/${encodeURIComponent(latest.tag)}`}
                        className="text-accent hover:underline"
                    >
                        {latest.tag}
                    </Link>
                    . Loaded live from GitHub.
                </p>
            )}
            {!changes && (
                <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
                    Changes are temporarily unavailable - try again shortly.
                </div>
            )}
            {groups.map((g) => (
                <details
                    key={g.id}
                    open
                    className="rounded-2xl border border-white/10 bg-zinc-950/40"
                >
                    <summary
                        className={`cursor-pointer px-6 py-3 text-xs font-bold uppercase tracking-wide ${GROUP_COLOR[g.id]}`}
                    >
                        {g.label} · {g.commits.length}
                    </summary>
                    <ul className="divide-y divide-white/5 border-t border-white/10">
                        {g.commits.map((c) => (
                            <li
                                key={c.sha}
                                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-6 py-2.5 text-sm"
                            >
                                {c.scope && (
                                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-zinc-300">
                                        {c.scope}
                                    </span>
                                )}
                                <span className="min-w-0 flex-1 text-zinc-200">
                                    {c.title}
                                </span>
                                {c.author && (
                                    <span className="text-xs text-zinc-400">
                                        @{c.author}
                                    </span>
                                )}
                                <a
                                    href={c.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-zinc-400 transition-colors hover:text-accent"
                                >
                                    {c.sha.slice(0, 7)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </details>
            ))}
        </section>
    );
}

function FeatureBlock({ feature }: { feature: Feature }) {
    return (
        <section
            id={feature.id}
            className="scroll-mt-24 space-y-4 rounded-2xl border border-white/10 bg-zinc-950/40 p-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-zinc-100">
                    {feature.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">{feature.summary}</p>
            </div>
        </section>
    );
}

export default function FeaturesPage() {
    return (
        <div className="relative flex-1 px-6 pb-16 pt-12">
            <GridBackdrop />
            <div className="mx-auto max-w-[1350px]">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-300 sm:text-4xl">
                    Feature <span className="text-accent">Reference</span>
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-zinc-400">
                    Everything SwiftlyS2 gives a plugin, with code for each
                    area. The recent changes list is pulled from the latest
                    stable release.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {featureStats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-white/10 bg-zinc-950/40 p-4"
                        >
                            <div className="text-2xl font-bold text-accent">
                                {stat.value}
                            </div>
                            <div className="mt-1 text-xs text-zinc-400">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr]">
                    <nav aria-label="On this page" className="hidden lg:block">
                        <div className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-5 overflow-y-auto pr-2 text-sm">
                            <a
                                href="#recent"
                                className="block font-semibold text-zinc-300 transition-colors hover:text-accent"
                            >
                                Recent changes
                            </a>
                            {featureGroups.map((group) => (
                                <div key={group.id}>
                                    <a
                                        href={`#${group.id}`}
                                        className="font-semibold text-zinc-300 transition-colors hover:text-accent"
                                    >
                                        {group.title}
                                    </a>
                                    <ul className="mt-1.5 space-y-1 border-l border-white/10 pl-3">
                                        {group.features.map((feature) => (
                                            <li key={feature.id}>
                                                <a
                                                    href={`#${feature.id}`}
                                                    className="text-zinc-500 transition-colors hover:text-white"
                                                >
                                                    {feature.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            <a
                                href="#fixes"
                                className="block font-semibold text-zinc-300 transition-colors hover:text-accent"
                            >
                                Fixes
                            </a>
                        </div>
                    </nav>

                    <div className="min-w-0 space-y-16">
                        <Suspense
                            fallback={
                                <div className="text-sm text-zinc-500">
                                    Loading recent changes...
                                </div>
                            }
                        >
                            <RecentChanges />
                        </Suspense>

                        {featureGroups.map((group) => (
                            <section
                                key={group.id}
                                id={group.id}
                                className="scroll-mt-24 space-y-6"
                            >
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {group.title}
                                    </h2>
                                    <p className="mt-1 text-sm text-zinc-400">
                                        {group.blurb}
                                    </p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {group.features.map((feature) => (
                                        <FeatureBlock
                                            key={feature.id}
                                            feature={feature}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}

                        <section id="fixes" className="scroll-mt-24 space-y-4">
                            <h2 className="text-2xl font-bold text-white">
                                Fixes
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {fixes.map((fix) => (
                                    <section
                                        key={fix.title}
                                        className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/40 p-6"
                                    >
                                        <h3 className="text-lg font-semibold text-zinc-100">
                                            {fix.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-zinc-400">
                                            {fix.summary}
                                        </p>
                                    </section>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
