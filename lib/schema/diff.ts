import type { SchemaClass, SchemaDump, SchemaField } from "@/lib/schema/types";
import {
    getClassFieldDisplays,
    toInterfaceName,
} from "@/lib/schema/codegen/csharp";

export type ChangeKind = "added" | "removed" | "changed";

export type DiffField = SchemaField & {
    csharpName: string;
    csharpType: string;
};

export type FieldDiff = {
    name: string;
    change: ChangeKind;
    before?: DiffField;
    after?: DiffField;
};

export type ClassDiff = {
    key: string;
    project: string;
    name: string;
    csharpName: string;
    change: ChangeKind;
    fieldDiffs: FieldDiff[];
    baseClassesChanged: boolean;
    sizeChanged: boolean;
    before?: { size: number; base_classes?: string[] };
    after?: { size: number; base_classes?: string[] };
};

export type EnumMemberDiff = {
    name: string;
    change: ChangeKind;
    before?: number;
    after?: number;
};

export type EnumDiff = {
    key: string;
    project: string;
    name: string;
    csharpName: string;
    change: ChangeKind;
    memberDiffs: EnumMemberDiff[];
};

export type SchemaDiff = {
    classes: ClassDiff[];
    enums: EnumDiff[];
};

function keyOf(project: string, name: string): string {
    return `${project}::${name}`;
}

function fieldsEqual(a: SchemaField, b: SchemaField): boolean {
    return (
        a.type === b.type &&
        a.offset === b.offset &&
        a.size === b.size &&
        a.kind === b.kind &&
        a.networked === b.networked &&
        a.element_count === b.element_count &&
        a.templated === b.templated
    );
}

function fieldDisplaysByName(
    cls: SchemaClass,
    allClassNames: Set<string>,
    allEnumNames: Set<string>,
): Map<string, DiffField> {
    const fields = cls.fields ?? [];
    const displays = getClassFieldDisplays(cls, allClassNames, allEnumNames);
    return new Map(
        fields.map((field, i) => [
            field.name,
            {
                ...field,
                csharpName: displays[i].name,
                csharpType: displays[i].type,
            },
        ]),
    );
}

function diffFields(
    beforeClass: SchemaClass,
    afterClass: SchemaClass,
    beforeNames: { classes: Set<string>; enums: Set<string> },
    afterNames: { classes: Set<string>; enums: Set<string> },
): FieldDiff[] {
    const beforeByName = fieldDisplaysByName(
        beforeClass,
        beforeNames.classes,
        beforeNames.enums,
    );
    const afterByName = fieldDisplaysByName(
        afterClass,
        afterNames.classes,
        afterNames.enums,
    );
    const diffs: FieldDiff[] = [];

    for (const [name, field] of beforeByName) {
        if (!afterByName.has(name)) {
            diffs.push({ name, change: "removed", before: field });
        }
    }
    for (const [name, field] of afterByName) {
        const prev = beforeByName.get(name);
        if (!prev) {
            diffs.push({ name, change: "added", after: field });
        } else if (!fieldsEqual(prev, field)) {
            diffs.push({ name, change: "changed", before: prev, after: field });
        }
    }
    return diffs;
}

const CHANGE_ORDER: Record<ChangeKind, number> = {
    added: 0,
    removed: 1,
    changed: 2,
};

export function computeSchemaDiff(
    before: SchemaDump,
    after: SchemaDump,
): SchemaDiff {
    const beforeNames = {
        classes: new Set(
            before.classes.map((c) => c.name.replaceAll(":", "_")),
        ),
        enums: new Set(before.enums.map((e) => e.name.replaceAll(":", "_"))),
    };
    const afterNames = {
        classes: new Set(after.classes.map((c) => c.name.replaceAll(":", "_"))),
        enums: new Set(after.enums.map((e) => e.name.replaceAll(":", "_"))),
    };

    const beforeClasses = new Map(
        before.classes.map((c) => [keyOf(c.project, c.name), c]),
    );
    const afterClasses = new Map(
        after.classes.map((c) => [keyOf(c.project, c.name), c]),
    );
    const classKeys = new Set([
        ...beforeClasses.keys(),
        ...afterClasses.keys(),
    ]);

    const classes: ClassDiff[] = [];
    for (const key of classKeys) {
        const b = beforeClasses.get(key);
        const a = afterClasses.get(key);

        if (b && !a) {
            classes.push({
                key,
                project: b.project,
                name: b.name,
                csharpName: toInterfaceName(b.name),
                change: "removed",
                fieldDiffs: [],
                baseClassesChanged: false,
                sizeChanged: false,
                before: { size: b.size, base_classes: b.base_classes },
            });
            continue;
        }
        if (a && !b) {
            classes.push({
                key,
                project: a.project,
                name: a.name,
                csharpName: toInterfaceName(a.name),
                change: "added",
                fieldDiffs: [],
                baseClassesChanged: false,
                sizeChanged: false,
                after: { size: a.size, base_classes: a.base_classes },
            });
            continue;
        }
        if (a && b) {
            const fieldDiffs = diffFields(b, a, beforeNames, afterNames);
            const baseClassesChanged =
                JSON.stringify(b.base_classes ?? []) !==
                JSON.stringify(a.base_classes ?? []);
            const sizeChanged = b.size !== a.size;

            if (fieldDiffs.length > 0 || baseClassesChanged || sizeChanged) {
                classes.push({
                    key,
                    project: a.project,
                    name: a.name,
                    csharpName: toInterfaceName(a.name),
                    change: "changed",
                    fieldDiffs,
                    baseClassesChanged,
                    sizeChanged,
                    before: { size: b.size, base_classes: b.base_classes },
                    after: { size: a.size, base_classes: a.base_classes },
                });
            }
        }
    }

    const beforeEnums = new Map(
        before.enums.map((e) => [keyOf(e.project, e.name), e]),
    );
    const afterEnums = new Map(
        after.enums.map((e) => [keyOf(e.project, e.name), e]),
    );
    const enumKeys = new Set([...beforeEnums.keys(), ...afterEnums.keys()]);

    const enums: EnumDiff[] = [];
    for (const key of enumKeys) {
        const b = beforeEnums.get(key);
        const a = afterEnums.get(key);

        if (b && !a) {
            enums.push({
                key,
                project: b.project,
                name: b.name,
                csharpName: toInterfaceName(b.name),
                change: "removed",
                memberDiffs: [],
            });
            continue;
        }
        if (a && !b) {
            enums.push({
                key,
                project: a.project,
                name: a.name,
                csharpName: toInterfaceName(a.name),
                change: "added",
                memberDiffs: [],
            });
            continue;
        }
        if (a && b) {
            const beforeMembers = new Map(
                b.fields.map((m) => [m.name, m.value]),
            );
            const afterMembers = new Map(
                a.fields.map((m) => [m.name, m.value]),
            );
            const memberDiffs: EnumMemberDiff[] = [];

            for (const [name, value] of beforeMembers) {
                if (!afterMembers.has(name)) {
                    memberDiffs.push({
                        name,
                        change: "removed",
                        before: value,
                    });
                }
            }
            for (const [name, value] of afterMembers) {
                const prev = beforeMembers.get(name);
                if (prev === undefined) {
                    memberDiffs.push({ name, change: "added", after: value });
                } else if (prev !== value) {
                    memberDiffs.push({
                        name,
                        change: "changed",
                        before: prev,
                        after: value,
                    });
                }
            }

            if (memberDiffs.length > 0) {
                enums.push({
                    key,
                    project: a.project,
                    name: a.name,
                    csharpName: toInterfaceName(a.name),
                    change: "changed",
                    memberDiffs,
                });
            }
        }
    }

    const byChangeThenName = (
        x: { change: ChangeKind; name: string },
        y: { change: ChangeKind; name: string },
    ) =>
        CHANGE_ORDER[x.change] - CHANGE_ORDER[y.change] ||
        x.name.localeCompare(y.name);

    classes.sort(byChangeThenName);
    enums.sort(byChangeThenName);

    return { classes, enums };
}
