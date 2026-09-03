import type { ReactNode } from "react";
import type {
    ChangeKind,
    GameEventDiff,
    GameEventFieldDiffEntry,
    GameEventsDiff,
} from "@/lib/gameevents/diff";

const CHANGE_STYLES: Record<
    ChangeKind,
    { label: string; dot: string; text: string }
> = {
    added: { label: "added", dot: "bg-accent", text: "text-accent" },
    removed: { label: "removed", dot: "bg-rose-500", text: "text-rose-400" },
    changed: { label: "changed", dot: "bg-amber-500", text: "text-amber-400" },
};

function FieldDiffRow({ diff }: { diff: GameEventFieldDiffEntry }) {
    const style = CHANGE_STYLES[diff.change];
    const shown = (diff.after ?? diff.before)!;

    return (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm">
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                />
                <span className="font-semibold text-white">{shown.name}</span>
                {diff.change === "added" && diff.after && (
                    <span className="text-zinc-400">{diff.after.type}</span>
                )}
                {diff.change === "removed" && diff.before && (
                    <span className="text-zinc-400">{diff.before.type}</span>
                )}
                {diff.change === "changed" && diff.before && diff.after && (
                    <span className="text-zinc-400">
                        {diff.before.type}{" "}
                        <span className="text-zinc-600">&rarr;</span>{" "}
                        {diff.after.type}
                    </span>
                )}
            </div>
        </div>
    );
}

function EventCard({ entry }: { entry: GameEventDiff }) {
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
                <div className="mt-4 space-y-3">
                    {entry.commentChanged && (
                        <div className="font-mono text-sm text-amber-400">
                            description: {entry.beforeComment || "-"}{" "}
                            <span className="text-zinc-600">&rarr;</span>{" "}
                            {entry.afterComment || "-"}
                        </div>
                    )}

                    {entry.fieldDiffs.length > 0 && (
                        <div className="space-y-1.5">
                            {entry.fieldDiffs.map((fd) => (
                                <FieldDiffRow key={fd.fieldName} diff={fd} />
                            ))}
                        </div>
                    )}
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

export function GameEventsDiffView({
    diff,
    from,
    to,
}: {
    diff: GameEventsDiff;
    from: string;
    to: string;
}) {
    const hasChanges = diff.events.length > 0;

    const eventsByChange = {
        added: diff.events.filter((e) => e.change === "added"),
        removed: diff.events.filter((e) => e.change === "removed"),
        changed: diff.events.filter((e) => e.change === "changed"),
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
                    No game event differences between these two versions.
                </div>
            )}

            {diff.events.length > 0 && (
                <div>
                    <h2 className="font-mono text-2xl font-bold text-white">
                        Events
                    </h2>
                    <div className="mt-4 space-y-6">
                        <Section
                            title="Added"
                            items={eventsByChange.added}
                            render={(e) => <EventCard key={e.key} entry={e} />}
                        />
                        <Section
                            title="Removed"
                            items={eventsByChange.removed}
                            render={(e) => <EventCard key={e.key} entry={e} />}
                        />
                        <Section
                            title="Changed"
                            items={eventsByChange.changed}
                            render={(e) => <EventCard key={e.key} entry={e} />}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
