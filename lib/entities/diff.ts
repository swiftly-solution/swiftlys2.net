import type {
    DatamapField,
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

export type FieldDiffEntry = {
    fieldName: string;
    change: ChangeKind;
    before?: DatamapField;
    after?: DatamapField;
};

export type NameDiffEntry = { name: string; change: "added" | "removed" };

export type DatamapDiff = {
    key: string;
    className: string;
    change: ChangeKind;
    memberDiffs: FieldDiffEntry[];
    inputDiffs: FieldDiffEntry[];
    outputDiffs: FieldDiffEntry[];
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

function fieldsEqual(a: DatamapField, b: DatamapField): boolean {
    return a.externalName === b.externalName && a.fieldType === b.fieldType;
}

function diffFieldList(
    before: DatamapField[],
    after: DatamapField[],
): FieldDiffEntry[] {
    const beforeByName = new Map(before.map((f) => [f.fieldName, f]));
    const afterByName = new Map(after.map((f) => [f.fieldName, f]));
    const diffs: FieldDiffEntry[] = [];

    for (const [fieldName, field] of beforeByName) {
        if (!afterByName.has(fieldName)) {
            diffs.push({ fieldName, change: "removed", before: field });
        }
    }
    for (const [fieldName, field] of afterByName) {
        const prev = beforeByName.get(fieldName);
        if (!prev) {
            diffs.push({ fieldName, change: "added", after: field });
        } else if (!fieldsEqual(prev, field)) {
            diffs.push({
                fieldName,
                change: "changed",
                before: prev,
                after: field,
            });
        }
    }
    return diffs;
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
                memberDiffs: diffFieldList(b.fields.members ?? [], []),
                inputDiffs: diffFieldList(b.fields.inputs ?? [], []),
                outputDiffs: diffFieldList(b.fields.outputs ?? [], []),
                thinkFunctionDiffs: diffThinkFunctions(b.think_functions, []),
            });
            continue;
        }
        if (a && !b) {
            datamaps.push({
                key,
                className: a.class_name,
                change: "added",
                memberDiffs: diffFieldList([], a.fields.members ?? []),
                inputDiffs: diffFieldList([], a.fields.inputs ?? []),
                outputDiffs: diffFieldList([], a.fields.outputs ?? []),
                thinkFunctionDiffs: diffThinkFunctions([], a.think_functions),
            });
            continue;
        }
        if (a && b) {
            const memberDiffs = diffFieldList(
                b.fields.members ?? [],
                a.fields.members ?? [],
            );
            const inputDiffs = diffFieldList(
                b.fields.inputs ?? [],
                a.fields.inputs ?? [],
            );
            const outputDiffs = diffFieldList(
                b.fields.outputs ?? [],
                a.fields.outputs ?? [],
            );
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
