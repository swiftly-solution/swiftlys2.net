import type { ReactNode } from "react";
import type { EntityClass } from "@/lib/entities/types";
import type {
    ChangeKind,
    DatamapDiff,
    EntitiesDiff,
    EntityClassDiff,
    InputDiffEntry,
    MemberDiffEntry,
    OutputDiffEntry,
} from "@/lib/entities/diff";

const CHANGE_STYLES: Record<
    ChangeKind,
    { label: string; dot: string; text: string }
> = {
    added: { label: "added", dot: "bg-accent", text: "text-accent" },
    removed: { label: "removed", dot: "bg-rose-500", text: "text-rose-400" },
    changed: { label: "changed", dot: "bg-amber-500", text: "text-amber-400" },
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

function EntityClassCard({ entry }: { entry: EntityClassDiff }) {
    const style = CHANGE_STYLES[entry.change];
    const shown = (entry.after ?? entry.before) as EntityClass;

    return (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5">
            <div className="flex flex-wrap items-center gap-3">
                <span
                    className={`rounded-full border border-white/10 px-2.5 py-1 font-mono text-xs uppercase tracking-wide ${style.text}`}
                >
                    {style.label}
                </span>
                <h3 className="font-mono text-lg font-bold text-white">
                    {entry.className}
                </h3>
                <span className="font-mono text-sm text-zinc-500">
                    {shown.designer_name}
                </span>
            </div>

            {entry.change === "changed" && entry.before && entry.after ? (
                <div className="mt-3 space-y-1.5">
                    <PropertyDiffLine
                        label="designer name"
                        before={entry.before.designer_name}
                        after={entry.after.designer_name}
                    />
                    <PropertyDiffLine
                        label="flags"
                        before={flagsLabel(entry.before.flags)}
                        after={flagsLabel(entry.after.flags)}
                    />
                </div>
            ) : (
                shown.flags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {shown.flags.map((flag) => (
                            <span
                                key={flag}
                                className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-zinc-300"
                            >
                                {flag}
                            </span>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

function MemberDiffRow({ entry }: { entry: MemberDiffEntry }) {
    const style = CHANGE_STYLES[entry.change];
    const shown = (entry.after ?? entry.before)!;

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm">
            <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
            <span className="font-semibold text-white">{shown.name}</span>
            {entry.change === "added" && entry.after && (
                <span className="text-zinc-400">{entry.after.type}</span>
            )}
            {entry.change === "removed" && entry.before && (
                <span className="text-zinc-400">{entry.before.type}</span>
            )}
            {entry.change === "changed" && entry.before && entry.after && (
                <span className="text-zinc-400">
                    {entry.before.type}{" "}
                    <span className="text-zinc-600">&rarr;</span>{" "}
                    {entry.after.type}
                </span>
            )}
        </div>
    );
}

function OutputDiffRow({ entry }: { entry: OutputDiffEntry }) {
    const style = CHANGE_STYLES[entry.change];
    const shown = (entry.after ?? entry.before)!;

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm">
            <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
            <span className="font-semibold text-white">{shown.name}</span>
        </div>
    );
}

function InputSignature({ input }: { input: InputDiffEntry["before"] }) {
    if (!input) return null;
    return (
        <span className="text-zinc-400">
            ({input.parameter_types.join(", ")}){" "}
            <span className="text-zinc-600">-&gt;</span> {input.return_type}
        </span>
    );
}

function InputDiffRow({ entry }: { entry: InputDiffEntry }) {
    const style = CHANGE_STYLES[entry.change];
    const shown = (entry.after ?? entry.before)!;

    return (
        <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm">
            <div className="flex flex-wrap items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                <span className="font-semibold text-white">{shown.name}</span>
                {entry.change === "changed" && entry.before && entry.after ? (
                    <span className="flex flex-wrap items-center gap-1.5">
                        <InputSignature input={entry.before} />
                        <span className="text-zinc-600">&rarr;</span>
                        <InputSignature input={entry.after} />
                    </span>
                ) : (
                    <InputSignature input={shown} />
                )}
            </div>
            <div className="pl-4 font-mono text-xs text-zinc-500">
                raw: {shown.raw_name}
            </div>
        </div>
    );
}

function DatamapCard({ entry }: { entry: DatamapDiff }) {
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
                    {entry.className}
                </h3>
            </div>

            {(entry.memberDiffs.length > 0 ||
                entry.inputDiffs.length > 0 ||
                entry.outputDiffs.length > 0 ||
                entry.thinkFunctionDiffs.length > 0) && (
                <div className="mt-4 space-y-4">
                    {entry.memberDiffs.length > 0 && (
                        <div>
                            <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                                Members ({entry.memberDiffs.length})
                            </div>
                            <div className="mt-2 space-y-1.5">
                                {entry.memberDiffs.map((f) => (
                                    <MemberDiffRow key={f.key} entry={f} />
                                ))}
                            </div>
                        </div>
                    )}
                    {entry.inputDiffs.length > 0 && (
                        <div>
                            <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                                Inputs ({entry.inputDiffs.length})
                            </div>
                            <div className="mt-2 space-y-1.5">
                                {entry.inputDiffs.map((f) => (
                                    <InputDiffRow key={f.key} entry={f} />
                                ))}
                            </div>
                        </div>
                    )}
                    {entry.outputDiffs.length > 0 && (
                        <div>
                            <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                                Outputs ({entry.outputDiffs.length})
                            </div>
                            <div className="mt-2 space-y-1.5">
                                {entry.outputDiffs.map((f) => (
                                    <OutputDiffRow key={f.key} entry={f} />
                                ))}
                            </div>
                        </div>
                    )}
                    {entry.thinkFunctionDiffs.length > 0 && (
                        <div>
                            <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                                Think Functions (
                                {entry.thinkFunctionDiffs.length})
                            </div>
                            <div className="mt-2 space-y-1.5">
                                {entry.thinkFunctionDiffs.map((fn) => (
                                    <div
                                        key={fn.name}
                                        className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm"
                                    >
                                        <span
                                            className={`h-2 w-2 shrink-0 rounded-full ${CHANGE_STYLES[fn.change].dot}`}
                                        />
                                        <span className="font-semibold text-white">
                                            {fn.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
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

export function EntitiesDiffView({
    diff,
    from,
    to,
}: {
    diff: EntitiesDiff;
    from: string;
    to: string;
}) {
    const hasChanges =
        diff.entityClasses.length > 0 || diff.datamaps.length > 0;

    const classesByChange = {
        added: diff.entityClasses.filter((c) => c.change === "added"),
        removed: diff.entityClasses.filter((c) => c.change === "removed"),
        changed: diff.entityClasses.filter((c) => c.change === "changed"),
    };
    const datamapsByChange = {
        added: diff.datamaps.filter((d) => d.change === "added"),
        removed: diff.datamaps.filter((d) => d.change === "removed"),
        changed: diff.datamaps.filter((d) => d.change === "changed"),
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
                    No entity data differences between these two versions.
                </div>
            )}

            {diff.entityClasses.length > 0 && (
                <div>
                    <h2 className="font-mono text-2xl font-bold text-white">
                        Entity Classes
                    </h2>
                    <div className="mt-4 space-y-6">
                        <Section
                            title="Added"
                            items={classesByChange.added}
                            render={(c) => (
                                <EntityClassCard key={c.key} entry={c} />
                            )}
                        />
                        <Section
                            title="Removed"
                            items={classesByChange.removed}
                            render={(c) => (
                                <EntityClassCard key={c.key} entry={c} />
                            )}
                        />
                        <Section
                            title="Changed"
                            items={classesByChange.changed}
                            render={(c) => (
                                <EntityClassCard key={c.key} entry={c} />
                            )}
                        />
                    </div>
                </div>
            )}

            {diff.datamaps.length > 0 && (
                <div>
                    <h2 className="font-mono text-2xl font-bold text-white">
                        Datamaps
                    </h2>
                    <div className="mt-4 space-y-6">
                        <Section
                            title="Added"
                            items={datamapsByChange.added}
                            render={(d) => (
                                <DatamapCard key={d.key} entry={d} />
                            )}
                        />
                        <Section
                            title="Removed"
                            items={datamapsByChange.removed}
                            render={(d) => (
                                <DatamapCard key={d.key} entry={d} />
                            )}
                        />
                        <Section
                            title="Changed"
                            items={datamapsByChange.changed}
                            render={(d) => (
                                <DatamapCard key={d.key} entry={d} />
                            )}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
