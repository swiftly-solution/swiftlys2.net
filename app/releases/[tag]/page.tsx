import Link from "next/link";
import { notFound } from "next/navigation";
import { formatTimestamp, findAsset } from "@/lib/github";
import {
    cycleBetas,
    diffBase,
    getAllReleases,
    getChanges,
    groupChanges,
    type GroupId,
} from "@/lib/releases";

const GROUP_COLOR: Record<GroupId, string> = {
    breaking: "text-red-400",
    feat: "text-accent",
    fix: "text-amber-400",
    docs: "text-violet-400",
    other: "text-zinc-400",
};

export default async function ReleasePage(props: PageProps<"/releases/[tag]">) {
    const tag = decodeURIComponent((await props.params).tag);
    const releases = await getAllReleases();
    const release = releases.find((r) => r.tag === tag);
    if (!release) notFound();

    const base = diffBase(releases, release);
    const changes = base ? await getChanges(base.tag, release.tag) : null;
    const groups = changes ? groupChanges(changes.commits) : [];
    const contributors = changes
        ? new Set(changes.commits.map((c) => c.author).filter(Boolean)).size
        : 0;
    const betas = release.prerelease ? [] : cycleBetas(releases, release);
    const downloads = (["windows", "linux"] as const).flatMap((os) => {
        const asset = findAsset(release.assets, os, false);
        return asset ? [{ os, url: asset.url }] : [];
    });

    return (
        <article className="space-y-6">
            <header>
                <div className="flex flex-wrap items-center gap-3">
                    <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-bold uppercase ${
                            release.prerelease
                                ? "bg-accent/10 text-accent"
                                : "bg-amber-400/10 text-amber-400"
                        }`}
                    >
                        {release.prerelease ? "beta" : "stable"}
                    </span>
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">
                        {release.tag}
                    </h2>
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                    {formatTimestamp(release.publishedAt)} UTC
                    {base && changes && (
                        <>
                            {" "}
                            · since {base.tag} · {changes.total} commit
                            {changes.total === 1 ? "" : "s"} · {contributors}{" "}
                            contributor{contributors === 1 ? "" : "s"}
                        </>
                    )}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    {downloads.map((d) => (
                        <a
                            key={d.os}
                            href={d.url}
                            className="rounded-lg bg-accent px-3 py-1.5 font-medium text-black transition-opacity hover:opacity-90"
                        >
                            Download {d.os}
                        </a>
                    ))}
                    <a
                        href={release.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-300 transition-colors hover:text-white"
                    >
                        GitHub release
                    </a>
                    {changes && (
                        <a
                            href={changes.compareUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-300 transition-colors hover:text-white"
                        >
                            Compare
                        </a>
                    )}
                </div>
            </header>

            {base && !changes && (
                <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
                    Changes are temporarily unavailable - try again shortly.
                </div>
            )}

            {changes && (
                <div className="flex flex-wrap gap-2 text-xs">
                    {groups.map((g) => (
                        <span
                            key={g.id}
                            className="rounded-full border border-white/10 px-3 py-1 text-zinc-300"
                        >
                            <b className={GROUP_COLOR[g.id]}>
                                {g.commits.length}
                            </b>{" "}
                            {g.label.toLowerCase()}
                        </span>
                    ))}
                </div>
            )}

            {groups.map((g) => (
                <details
                    key={g.id}
                    open={g.open}
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

            {changes && changes.total > changes.commits.length && (
                <p className="text-xs text-zinc-400">
                    Showing {changes.commits.length} of {changes.total} commits.{" "}
                    <a
                        href={changes.compareUrl}
                        className="text-accent hover:underline"
                    >
                        See all on GitHub
                    </a>
                </p>
            )}

            {betas.length > 0 && (
                <details className="rounded-2xl border border-white/10 bg-zinc-950/40">
                    <summary className="cursor-pointer px-6 py-3 text-xs font-bold uppercase tracking-wide text-zinc-400">
                        Betas in this cycle · {betas.length}
                    </summary>
                    <ul className="flex flex-wrap gap-2 border-t border-white/10 px-6 py-4 text-sm">
                        {betas.map((b) => (
                            <li key={b.tag}>
                                <Link
                                    href={`/releases/${encodeURIComponent(b.tag)}`}
                                    className="inline-block rounded-md border border-white/10 px-2.5 py-1 text-zinc-300 transition-colors hover:text-accent"
                                >
                                    {b.tag}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </details>
            )}
        </article>
    );
}
