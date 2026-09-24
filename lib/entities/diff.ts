import type {
    DatamapInput,
    DatamapMember,
    DatamapOutput,
    EntitiesDump,
    EntityClass,
} from "@/lib/entities/types";

export type ChangeKind = "added" | "removed" | "changed";

export type EntityClassDiff = {
    key: string;
    className: string;
    change: ChangeKind;
    before?: EntityClass;
    after?: EntityClass;
};

export type MemberDiffEntry = {
    key: string;
    change: ChangeKind;
    before?: DatamapMember;
    after?: DatamapMember;
};
export type OutputDiffEntry = {
    key: string;
    change: ChangeKind;
    before?: DatamapOutput;
    after?: DatamapOutput;
};
export type InputDiffEntry = {
    key: string;
    change: ChangeKind;
    before?: DatamapInput;
    after?: DatamapInput;
};

export type NameDiffEntry = { name: string; change: "added" | "removed" };

export type DatamapDiff = {
    key: string;
    className: string;
    change: ChangeKind;
    memberDiffs: MemberDiffEntry[];
    inputDiffs: InputDiffEntry[];
    outputDiffs: OutputDiffEntry[];
    thinkFunctionDiffs: NameDiffEntry[];
};

export type EntitiesDiff = {
    entityClasses: EntityClassDiff[];
    datamaps: DatamapDiff[];
};

function sortedFlags(flags: string[]): string[] {
    return [...flags].sort();
}

function entityClassesEqual(a: EntityClass, b: EntityClass): boolean {
    return (
        a.designer_name === b.designer_name &&
        JSON.stringify(sortedFlags(a.flags)) ===
            JSON.stringify(sortedFlags(b.flags))
    );
}

function diffList<T, E extends { key: string; change: ChangeKind; before?: T; after?: T }>(
    before: T[],
    after: T[],
    getKey: (item: T) => string,
    equal: (a: T, b: T) => boolean,
): E[] {
    const beforeByKey = new Map(before.map((item) => [getKey(item), item]));
    const afterByKey = new Map(after.map((item) => [getKey(item), item]));
    const diffs: E[] = [];

    for (const [key, item] of beforeByKey) {
        if (!afterByKey.has(key)) {
            diffs.push({ key, change: "removed", before: item } as E);
        }
    }
    for (const [key, item] of afterByKey) {
        const prev = beforeByKey.get(key);
        if (!prev) {
            diffs.push({ key, change: "added", after: item } as E);
        } else if (!equal(prev, item)) {
            diffs.push({ key, change: "changed", before: prev, after: item } as E);
        }
    }
    return diffs;
}

function memberEqual(a: DatamapMember, b: DatamapMember): boolean {
    return a.name === b.name && a.type === b.type;
}

function outputEqual(a: DatamapOutput, b: DatamapOutput): boolean {
    return a.name === b.name;
}

function inputEqual(a: DatamapInput, b: DatamapInput): boolean {
    return (
        a.name === b.name &&
        a.description === b.description &&
        a.return_type === b.return_type &&
        JSON.stringify(a.parameter_types) === JSON.stringify(b.parameter_types)
    );
}

function diffMemberList(before: DatamapMember[], after: DatamapMember[]): MemberDiffEntry[] {
    return diffList<DatamapMember, MemberDiffEntry>(
        before,
        after,
        (m) => m.schema_name,
        memberEqual,
    );
}

function diffOutputList(before: DatamapOutput[], after: DatamapOutput[]): OutputDiffEntry[] {
    return diffList<DatamapOutput, OutputDiffEntry>(
        before,
        after,
        (o) => o.schema_name,
        outputEqual,
    );
}

function diffInputList(before: DatamapInput[], after: DatamapInput[]): InputDiffEntry[] {
    return diffList<DatamapInput, InputDiffEntry>(
        before,
        after,
        (i) => i.raw_name,
        inputEqual,
    );
}

function diffThinkFunctions(
    before: string[],
    after: string[],
): NameDiffEntry[] {
    const beforeSet = new Set(before);
    const afterSet = new Set(after);
    const diffs: NameDiffEntry[] = [];
    for (const name of beforeSet) {
        if (!afterSet.has(name)) diffs.push({ name, change: "removed" });
    }
    for (const name of afterSet) {
        if (!beforeSet.has(name)) diffs.push({ name, change: "added" });
    }
    return diffs;
}

const CHANGE_ORDER: Record<ChangeKind, number> = {
    added: 0,
    removed: 1,
    changed: 2,
};

const byChangeThenName = (
    x: { change: ChangeKind; className: string },
    y: { change: ChangeKind; className: string },
) =>
    CHANGE_ORDER[x.change] - CHANGE_ORDER[y.change] ||
    x.className.localeCompare(y.className);

export function computeEntitiesDiff(
    before: EntitiesDump,
    after: EntitiesDump,
): EntitiesDiff {
    const beforeClasses = new Map(
        before.entityClasses.map((c) => [c.class_name, c]),
    );
    const afterClasses = new Map(
        after.entityClasses.map((c) => [c.class_name, c]),
    );
    const classKeys = new Set([
        ...beforeClasses.keys(),
        ...afterClasses.keys(),
    ]);

    const entityClasses: EntityClassDiff[] = [];
    for (const key of classKeys) {
        const b = beforeClasses.get(key);
        const a = afterClasses.get(key);

        if (b && !a) {
            entityClasses.push({
                key,
                className: b.class_name,
                change: "removed",
                before: b,
            });
        } else if (a && !b) {
            entityClasses.push({
                key,
                className: a.class_name,
                change: "added",
                after: a,
            });
        } else if (a && b && !entityClassesEqual(a, b)) {
            entityClasses.push({
                key,
                className: a.class_name,
                change: "changed",
                before: b,
                after: a,
            });
        }
    }

    const beforeDatamaps = new Map(
        before.datamaps.map((m) => [m.class_name, m]),
    );
    const afterDatamaps = new Map(after.datamaps.map((m) => [m.class_name, m]));
    const datamapKeys = new Set([
        ...beforeDatamaps.keys(),
        ...afterDatamaps.keys(),
    ]);

    const datamaps: DatamapDiff[] = [];
    for (const key of datamapKeys) {
        const b = beforeDatamaps.get(key);
        const a = afterDatamaps.get(key);

        if (b && !a) {
            datamaps.push({
                key,
                className: b.class_name,
                change: "removed",
                memberDiffs: diffMemberList(b.members, []),
                inputDiffs: diffInputList(b.inputs, []),
                outputDiffs: diffOutputList(b.outputs, []),
                thinkFunctionDiffs: diffThinkFunctions(b.think_functions, []),
            });
            continue;
        }
        if (a && !b) {
            datamaps.push({
                key,
                className: a.class_name,
                change: "added",
                memberDiffs: diffMemberList([], a.members),
                inputDiffs: diffInputList([], a.inputs),
                outputDiffs: diffOutputList([], a.outputs),
                thinkFunctionDiffs: diffThinkFunctions([], a.think_functions),
            });
            continue;
        }
        if (a && b) {
            const memberDiffs = diffMemberList(b.members, a.members);
            const inputDiffs = diffInputList(b.inputs, a.inputs);
            const outputDiffs = diffOutputList(b.outputs, a.outputs);
            const thinkFunctionDiffs = diffThinkFunctions(
                b.think_functions,
                a.think_functions,
            );

            if (
                memberDiffs.length > 0 ||
                inputDiffs.length > 0 ||
                outputDiffs.length > 0 ||
                thinkFunctionDiffs.length > 0
            ) {
                datamaps.push({
                    key,
                    className: a.class_name,
                    change: "changed",
                    memberDiffs,
                    inputDiffs,
                    outputDiffs,
                    thinkFunctionDiffs,
                });
            }
        }
    }

    entityClasses.sort(byChangeThenName);
    datamaps.sort(byChangeThenName);

    return { entityClasses, datamaps };
}
