import type { ReactNode } from "react";
import type {
    ChangeKind,
    EnumValueDiffEntry,
    ProtobufDiff,
    ProtobufEnumDiff,
    ProtobufMessageDiff,
    ProtoFieldDiffEntry,
} from "@/lib/protobuf/diff";

const CHANGE_STYLES: Record<
    ChangeKind,
    { label: string; dot: string; text: string }
> = {
    added: { label: "added", dot: "bg-accent", text: "text-accent" },
    removed: { label: "removed", dot: "bg-rose-500", text: "text-rose-400" },
    changed: { label: "changed", dot: "bg-amber-500", text: "text-amber-400" },
};

function FieldDiffRow({ diff }: { diff: ProtoFieldDiffEntry }) {
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
            <div className="shrink-0 font-mono text-xs text-zinc-500">
                {diff.change === "changed" && diff.before && diff.after
                    ? `#${diff.before.number} → #${diff.after.number}`
                    : `#${shown.number}`}
            </div>
        </div>
    );
}

function ValueDiffRow({ diff }: { diff: EnumValueDiffEntry }) {
    const style = CHANGE_STYLES[diff.change];

    return (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm">
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                />
                <span className="font-semibold text-white">
                    {diff.valueName}
                </span>
            </div>
            <div className="shrink-0 font-mono text-xs text-zinc-500">
                {diff.change === "added" &&
                    diff.after &&
                    `= ${diff.after.value}`}
                {diff.change === "removed" &&
                    diff.before &&
                    `= ${diff.before.value}`}
                {diff.change === "changed" &&
                    diff.before &&
                    diff.after &&
                    `${diff.before.value} → ${diff.after.value}`}
            </div>
        </div>
    );
}

function MessageCard({ entry }: { entry: ProtobufMessageDiff }) {
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
                <span className="font-mono text-sm text-zinc-500">
                    {entry.file}
                </span>
            </div>

            {entry.change === "changed" && entry.fieldDiffs.length > 0 && (
                <div className="mt-4 space-y-1.5">
                    {entry.fieldDiffs.map((fd) => (
                        <FieldDiffRow key={fd.fieldName} diff={fd} />
                    ))}
                </div>
            )}
        </div>
    );
}

function EnumCard({ entry }: { entry: ProtobufEnumDiff }) {
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
                <span className="font-mono text-sm text-zinc-500">
                    {entry.file}
                </span>
            </div>

            {entry.change === "changed" && entry.valueDiffs.length > 0 && (
                <div className="mt-4 space-y-1.5">
                    {entry.valueDiffs.map((vd) => (
                        <ValueDiffRow key={vd.valueName} diff={vd} />
                    ))}
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

export function ProtobufDiffView({
    diff,
    from,
    to,
}: {
    diff: ProtobufDiff;
    from: string;
    to: string;
}) {
    const hasChanges = diff.messages.length > 0 || diff.enums.length > 0;

    const messagesByChange = {
        added: diff.messages.filter((m) => m.change === "added"),
        removed: diff.messages.filter((m) => m.change === "removed"),
        changed: diff.messages.filter((m) => m.change === "changed"),
    };
    const enumsByChange = {
        added: diff.enums.filter((e) => e.change === "added"),
        removed: diff.enums.filter((e) => e.change === "removed"),
        changed: diff.enums.filter((e) => e.change === "changed"),
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
                    No message/enum differences between these two versions.
                </div>
            )}

            {diff.messages.length > 0 && (
                <div>
                    <h2 className="font-mono text-2xl font-bold text-white">
                        Messages
                    </h2>
                    <div className="mt-4 space-y-6">
                        <Section
                            title="Added"
                            items={messagesByChange.added}
                            render={(m) => (
                                <MessageCard key={m.key} entry={m} />
                            )}
                        />
                        <Section
                            title="Removed"
                            items={messagesByChange.removed}
                            render={(m) => (
                                <MessageCard key={m.key} entry={m} />
                            )}
                        />
                        <Section
                            title="Changed"
                            items={messagesByChange.changed}
                            render={(m) => (
                                <MessageCard key={m.key} entry={m} />
                            )}
                        />
                    </div>
                </div>
            )}

            {diff.enums.length > 0 && (
                <div>
                    <h2 className="font-mono text-2xl font-bold text-white">
                        Enums
                    </h2>
                    <div className="mt-4 space-y-6">
                        <Section
                            title="Added"
                            items={enumsByChange.added}
                            render={(e) => <EnumCard key={e.key} entry={e} />}
                        />
                        <Section
                            title="Removed"
                            items={enumsByChange.removed}
                            render={(e) => <EnumCard key={e.key} entry={e} />}
                        />
                        <Section
                            title="Changed"
                            items={enumsByChange.changed}
                            render={(e) => <EnumCard key={e.key} entry={e} />}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
