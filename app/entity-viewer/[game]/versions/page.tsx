import { getBaseUrl } from "@/lib/base-url";
import { formatTimestamp } from "@/lib/github";
import type { Version } from "@/lib/schema/versions";

function versionLabel(v: Version): string {
    const version = v.patchVersion ?? v.sha.slice(0, 7);
    return v.buildId ? `${version} (build ${v.buildId})` : version;
}

export default async function EntityVersionsPage(
    props: PageProps<"/entity-viewer/[game]/versions">,
) {
    const { game: gameId } = await props.params;
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/entities/versions?game=${gameId}`);

    if (!res.ok) {
        return (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
                Version history is temporarily unavailable - try again shortly.
            </div>
        );
    }

    const versions: Version[] = await res.json();

    if (versions.length === 0) {
        return (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
                No version history found for this game.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {versions.length > 1 && (
                <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6">
                    <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                        Compare versions
                    </div>
                    <form
                        action={`/entity-viewer/${gameId}/diff`}
                        method="get"
                        className="mt-3 flex flex-wrap items-center gap-3"
                    >
                        <select
                            name="from"
                            defaultValue={versions[1].sha}
                            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:outline-none"
                        >
                            {versions.map((v) => (
                                <option key={v.sha} value={v.sha}>
                                    {versionLabel(v)}
                                </option>
                            ))}
                        </select>
                        <span className="font-mono text-sm text-zinc-500">
                            &rarr;
                        </span>
                        <select
                            name="to"
                            defaultValue={versions[0].sha}
                            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:outline-none"
                        >
                            {versions.map((v) => (
                                <option key={v.sha} value={v.sha}>
                                    {versionLabel(v)}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="rounded-lg bg-accent px-4 py-2 font-mono text-sm font-medium text-black transition-opacity hover:opacity-90"
                        >
                            view diff
                        </button>
                    </form>
                </div>
            )}

            <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-zinc-950/40">
                {versions.map((version, index) => {
                    const previous = versions[index + 1];
                    return (
                        <div
                            key={version.sha}
                            className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-lg font-bold text-white">
                                        {version.patchVersion ??
                                            version.sha.slice(0, 7)}
                                    </span>
                                    {version.buildId && (
                                        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
                                            build {version.buildId}
                                        </span>
                                    )}
                                    {version.filesModified !== null && (
                                        <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
                                            {version.filesModified} modified
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 font-mono text-xs text-zinc-500">
                                    {version.buildDate ??
                                        formatTimestamp(version.commitDate)}
                                </div>
                            </div>

                            {previous && (
                                <a
                                    href={`/entity-viewer/${gameId}/diff?from=${previous.sha}&to=${version.sha}`}
                                    className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-zinc-300 transition-colors hover:border-accent/30 hover:text-accent"
                                >
                                    view changes since{" "}
                                    {previous.patchVersion ??
                                        previous.sha.slice(0, 7)}
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
