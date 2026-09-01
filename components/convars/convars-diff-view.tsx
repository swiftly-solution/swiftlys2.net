import type { ReactNode } from "react";
import type { ConCommand, ConVar } from "@/lib/convars/types";
import type {
    ChangeKind,
    ConCommandDiff,
    ConVarDiff,
    ConvarsDiff,
} from "@/lib/convars/diff";

const CHANGE_STYLES: Record<ChangeKind, { label: string; text: string }> = {
    added: { label: "added", text: "text-accent" },
    removed: { label: "removed", text: "text-rose-400" },
    changed: { label: "changed", text: "text-amber-400" },
};

function sortedFlags(flags: string[]): string[] {
    return [...flags].sort();
}

function flagsLabel(flags: string[]): string {
    const sorted = sortedFlags(flags);
    return sorted.length > 0 ? sorted.join(", ") : "-";
}

function PropertyDiffLine({
    label,
    before,
    after,
}: {
    label: string;
    before: string;
    after: string;
}) {
    if (before === after) return null;
    return (
        <div className="font-mono text-sm text-amber-400">
            {label}: {before} <span className="text-zinc-600">&rarr;</span>{" "}
            {after}
        </div>
    );
}

function ConVarCard({ entry }: { entry: ConVarDiff }) {
    const style = CHANGE_STYLES[entry.change];
    const shown = (entry.after ?? entry.before) as ConVar;

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
                <span className="font-mono text-sm text-zinc-500">
                    {entry.module}
                </span>
            </div>

            {shown.description && (
                <p className="mt-2 text-sm text-zinc-500">
                    {shown.description}
                </p>
            )}

            {entry.change === "changed" && entry.before && entry.after && (
                <div className="mt-3 space-y-1.5">
                    <PropertyDiffLine
                        label="default"
                        before={entry.before.default ?? "-"}
                        after={entry.after.default ?? "-"}
                    />
                    <PropertyDiffLine
                        label="min"
                        before={entry.before.min ?? "-"}
                        after={entry.after.min ?? "-"}
                    />
                    <PropertyDiffLine
                        label="max"
                        before={entry.before.max ?? "-"}
                        after={entry.after.max ?? "-"}
                    />
                    <PropertyDiffLine
                        label="flags"
                        before={flagsLabel(entry.before.flags)}
                        after={flagsLabel(entry.after.flags)}
                    />
                    <PropertyDiffLine
                        label="description"
                        before={entry.before.description || "-"}
                        after={entry.after.description || "-"}
                    />
                </div>
            )}
        </div>
    );
}

function ConCommandCard({ entry }: { entry: ConCommandDiff }) {
    const style = CHANGE_STYLES[entry.change];
    const shown = (entry.after ?? entry.before) as ConCommand;

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
                <span className="font-mono text-sm text-zinc-500">
                    {entry.module}
                </span>
            </div>

            {shown.description && (
                <p className="mt-2 text-sm text-zinc-500">
                    {shown.description}
                </p>
            )}

            {entry.change === "changed" && entry.before && entry.after && (
                <div className="mt-3 space-y-1.5">
                    <PropertyDiffLine
                        label="flags"
                        before={flagsLabel(entry.before.flags)}
                        after={flagsLabel(entry.after.flags)}
                    />
                    <PropertyDiffLine
                        label="description"
                        before={entry.before.description || "-"}
                        after={entry.after.description || "-"}
                    />
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

export function ConvarsDiffView({
    diff,
    from,
    to,
}: {
    diff: ConvarsDiff;
    from: string;
    to: string;
}) {
    const hasChanges = diff.convars.length > 0 || diff.commands.length > 0;

    const convarsByChange = {
        added: diff.convars.filter((c) => c.change === "added"),
        removed: diff.convars.filter((c) => c.change === "removed"),
        changed: diff.convars.filter((c) => c.change === "changed"),
    };
    const commandsByChange = {
        added: diff.commands.filter((c) => c.change === "added"),
        removed: diff.commands.filter((c) => c.change === "removed"),
        changed: diff.commands.filter((c) => c.change === "changed"),
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
                    No convar/concommand differences between these two versions.
                </div>
            )}

            {diff.convars.length > 0 && (
                <div>
                    <h2 className="font-mono text-2xl font-bold text-white">
                        ConVars
                    </h2>
                    <div className="mt-4 space-y-6">
                        <Section
                            title="Added"
                            items={convarsByChange.added}
                            render={(c) => <ConVarCard key={c.key} entry={c} />}
                        />
                        <Section
                            title="Removed"
                            items={convarsByChange.removed}
                            render={(c) => <ConVarCard key={c.key} entry={c} />}
                        />
                        <Section
                            title="Changed"
                            items={convarsByChange.changed}
                            render={(c) => <ConVarCard key={c.key} entry={c} />}
                        />
                    </div>
                </div>
            )}

            {diff.commands.length > 0 && (
                <div>
                    <h2 className="font-mono text-2xl font-bold text-white">
                        ConCommands
                    </h2>
                    <div className="mt-4 space-y-6">
                        <Section
                            title="Added"
                            items={commandsByChange.added}
                            render={(c) => (
                                <ConCommandCard key={c.key} entry={c} />
                            )}
                        />
                        <Section
                            title="Removed"
                            items={commandsByChange.removed}
                            render={(c) => (
                                <ConCommandCard key={c.key} entry={c} />
                            )}
                        />
                        <Section
                            title="Changed"
                            items={commandsByChange.changed}
                            render={(c) => (
                                <ConCommandCard key={c.key} entry={c} />
                            )}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
