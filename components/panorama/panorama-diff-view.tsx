import type { ReactNode } from "react";
import { renderPanoramaDescription } from "@/lib/panorama/render";
import type {
    ChangeKind,
    PanoramaDiff,
    PanoramaPropertyDiff,
} from "@/lib/panorama/diff";

const CHANGE_STYLES: Record<
    ChangeKind,
    { label: string; text: string }
> = {
    added: { label: "added", text: "text-accent" },
    removed: { label: "removed", text: "text-rose-400" },
    changed: { label: "changed", text: "text-amber-400" },
};

function PropertyCard({ entry }: { entry: PanoramaPropertyDiff }) {
    const style = CHANGE_STYLES[entry.change];
    return (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5">
            <div className="flex flex-wrap items-center gap-3">
                <span
                    className={`rounded-full border border-white/10 px-2.5 py-1 font-mono text-xs uppercase tracking-wide ${style.text}`}
                >
                    {style.label}
                </span>
                <h3 className="font-mono text-lg font-bold text-white">
                    {entry.name}
                </h3>
            </div>

            {entry.change === "changed" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                        <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                            before
                        </div>
                        <div className="mt-1 text-sm text-zinc-400">
                            {entry.before
                                ? renderPanoramaDescription(entry.before)
                                : "-"}
                        </div>
                    </div>
                    <div>
                        <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                            after
                        </div>
                        <div className="mt-1 text-sm text-zinc-300">
                            {entry.after
                                ? renderPanoramaDescription(entry.after)
                                : "-"}
                        </div>
                    </div>
                </div>
            )}

            {entry.change === "added" && entry.after && (
                <div className="mt-4 text-sm text-zinc-300">
                    {renderPanoramaDescription(entry.after)}
                </div>
            )}

            {entry.change === "removed" && entry.before && (
                <div className="mt-4 text-sm text-zinc-500">
                    {renderPanoramaDescription(entry.before)}
                </div>
            )}
        </div>
    );
}

function Section<T>({
    title,
    items,
    render,
}: {
    title: string;
    items: T[];
    render: (item: T) => ReactNode;
}) {
    if (items.length === 0) return null;
    return (
        <div>
            <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                {title} ({items.length})
            </div>
            <div className="mt-3 space-y-3">{items.map(render)}</div>
        </div>
    );
}

export function PanoramaDiffView({
    diff,
    from,
    to,
}: {
    diff: PanoramaDiff;
    from: string;
    to: string;
}) {
    const hasChanges = diff.properties.length > 0;

    const byChange = {
        added: diff.properties.filter((p) => p.change === "added"),
        removed: diff.properties.filter((p) => p.change === "removed"),
        changed: diff.properties.filter((p) => p.change === "changed"),
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-500">
                <span className="rounded-full border border-white/10 px-2 py-1">
                    {from.slice(0, 7)}
                </span>
                <span>&rarr;</span>
                <span className="rounded-full border border-white/10 px-2 py-1">
                    {to.slice(0, 7)}
                </span>
            </div>

            {!hasChanges && (
                <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
                    No Panorama property differences between these two
                    versions.
                </div>
            )}

            {hasChanges && (
                <div>
                    <h2 className="font-mono text-2xl font-bold text-white">
                        Properties
                    </h2>
                    <div className="mt-4 space-y-6">
                        <Section
                            title="Added"
                            items={byChange.added}
                            render={(e) => (
                                <PropertyCard key={e.key} entry={e} />
                            )}
                        />
                        <Section
                            title="Removed"
                            items={byChange.removed}
                            render={(e) => (
                                <PropertyCard key={e.key} entry={e} />
                            )}
                        />
                        <Section
                            title="Changed"
                            items={byChange.changed}
                            render={(e) => (
                                <PropertyCard key={e.key} entry={e} />
                            )}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
