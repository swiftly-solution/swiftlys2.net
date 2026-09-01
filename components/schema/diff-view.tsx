"use client";

import type { ReactNode } from "react";
import { useSchemaLanguage } from "@/components/schema/language-context";
import { toInterfaceName } from "@/lib/schema/codegen/csharp";
import type {
    ClassDiff,
    DiffField,
    EnumDiff,
    EnumMemberDiff,
    FieldDiff,
    SchemaDiff,
} from "@/lib/schema/diff";

const CHANGE_STYLES: Record<
    "added" | "removed" | "changed",
    { label: string; dot: string; text: string }
> = {
    added: { label: "added", dot: "bg-accent", text: "text-accent" },
    removed: { label: "removed", dot: "bg-rose-500", text: "text-rose-400" },
    changed: { label: "changed", dot: "bg-amber-500", text: "text-amber-400" },
};

function fieldTypeLabel(field: DiffField, isCsharp: boolean): string {
    if (isCsharp) return field.csharpType;
    const type = field.templated ?? field.type;
    return field.kind === "fixed_array" && field.element_count !== undefined
        ? `${type} x ${field.element_count}`
        : type;
}

function baseClassesLabel(names: string[], isCsharp: boolean): string {
    const labels = isCsharp ? names.map(toInterfaceName) : names;
    return labels.join(", ") || "-";
}

function FieldDiffRow({ field }: { field: FieldDiff }) {
    const { language } = useSchemaLanguage();
    const isCsharp = language === "csharp";
    const style = CHANGE_STYLES[field.change];
    const name = isCsharp
        ? (field.after ?? field.before)!.csharpName
        : field.name;

    return (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm">
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                />
                <span className="font-semibold text-white">{name}</span>
                {field.change === "added" && field.after && (
                    <span className="text-zinc-400">
                        {fieldTypeLabel(field.after, isCsharp)}
                    </span>
                )}
                {field.change === "removed" && field.before && (
                    <span className="text-zinc-400">
                        {fieldTypeLabel(field.before, isCsharp)}
                    </span>
                )}
                {field.change === "changed" && field.before && field.after && (
                    <span className="text-zinc-400">
                        {fieldTypeLabel(field.before, isCsharp)}{" "}
                        <span className="text-zinc-600">&rarr;</span>{" "}
                        {fieldTypeLabel(field.after, isCsharp)}
                    </span>
                )}
            </div>
            <div className="shrink-0 font-mono text-xs text-zinc-500">
                {field.change === "changed" && field.before && field.after
                    ? `${field.before.offset} → ${field.after.offset}`
                    : (field.after ?? field.before)?.offset}
            </div>
        </div>
    );
}

function ClassDiffCard({ entry }: { entry: ClassDiff }) {
    const { language } = useSchemaLanguage();
    const isCsharp = language === "csharp";
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
                    {isCsharp ? entry.csharpName : entry.name}
                </h3>
                <span className="font-mono text-sm text-zinc-500">
                    {entry.project}
                </span>
            </div>

            {entry.change === "changed" && (
                <div className="mt-4 space-y-3">
                    {entry.sizeChanged && entry.before && entry.after && (
                        <div className="font-mono text-sm text-amber-400">
                            size: {entry.before.size} &rarr; {entry.after.size}
                        </div>
                    )}
                    {entry.baseClassesChanged &&
                        entry.before &&
                        entry.after && (
                            <div className="font-mono text-sm text-amber-400">
                                base classes:{" "}
                                {baseClassesLabel(
                                    entry.before.base_classes ?? [],
                                    isCsharp,
                                )}{" "}
                                &rarr;{" "}
                                {baseClassesLabel(
                                    entry.after.base_classes ?? [],
                                    isCsharp,
                                )}
                            </div>
                        )}
                    {entry.fieldDiffs.length > 0 && (
                        <div className="space-y-1.5">
                            {entry.fieldDiffs.map((field) => (
                                <FieldDiffRow key={field.name} field={field} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function EnumMemberRow({ member }: { member: EnumMemberDiff }) {
    const style = CHANGE_STYLES[member.change];
    return (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm">
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                />
                <span className="font-semibold text-white">{member.name}</span>
            </div>
            <div className="shrink-0 font-mono text-xs text-zinc-500">
                {member.change === "added" && `= ${member.after}`}
                {member.change === "removed" && `= ${member.before}`}
                {member.change === "changed" &&
                    `${member.before} → ${member.after}`}
            </div>
        </div>
    );
}

function EnumDiffCard({ entry }: { entry: EnumDiff }) {
    const { language } = useSchemaLanguage();
    const isCsharp = language === "csharp";
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
                    {isCsharp ? entry.csharpName : entry.name}
                </h3>
                <span className="font-mono text-sm text-zinc-500">
                    {entry.project}
                </span>
            </div>

            {entry.change === "changed" && entry.memberDiffs.length > 0 && (
                <div className="mt-4 space-y-1.5">
                    {entry.memberDiffs.map((member) => (
                        <EnumMemberRow key={member.name} member={member} />
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

export function DiffView({
    diff,
    from,
    to,
}: {
    diff: SchemaDiff;
    from: string;
    to: string;
}) {
    const hasChanges = diff.classes.length > 0 || diff.enums.length > 0;

    const classesByChange = {
        added: diff.classes.filter((c) => c.change === "added"),
        removed: diff.classes.filter((c) => c.change === "removed"),
        changed: diff.classes.filter((c) => c.change === "changed"),
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
                    No schema differences between these two versions.
                </div>
            )}

            {diff.classes.length > 0 && (
                <div>
                    <h2 className="font-mono text-2xl font-bold text-white">
                        Classes
                    </h2>
                    <div className="mt-4 space-y-6">
                        <Section
                            title="Added"
                            items={classesByChange.added}
                            render={(c) => (
                                <ClassDiffCard key={c.key} entry={c} />
                            )}
                        />
                        <Section
                            title="Removed"
                            items={classesByChange.removed}
                            render={(c) => (
                                <ClassDiffCard key={c.key} entry={c} />
                            )}
                        />
                        <Section
                            title="Changed"
                            items={classesByChange.changed}
                            render={(c) => (
                                <ClassDiffCard key={c.key} entry={c} />
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
                            render={(e) => (
                                <EnumDiffCard key={e.key} entry={e} />
                            )}
                        />
                        <Section
                            title="Removed"
                            items={enumsByChange.removed}
                            render={(e) => (
                                <EnumDiffCard key={e.key} entry={e} />
                            )}
                        />
                        <Section
                            title="Changed"
                            items={enumsByChange.changed}
                            render={(e) => (
                                <EnumDiffCard key={e.key} entry={e} />
                            )}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
