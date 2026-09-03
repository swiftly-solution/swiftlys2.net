import type { ProtoEnumValue, ProtoField } from "@/lib/protobuf/parser";
import type { ProtobufDump } from "@/lib/protobuf/types";

export type ChangeKind = "added" | "removed" | "changed";

export type ProtoFieldDiffEntry = {
    fieldName: string;
    change: ChangeKind;
    before?: ProtoField;
    after?: ProtoField;
};

export type ProtobufMessageDiff = {
    key: string;
    file: string;
    name: string;
    change: ChangeKind;
    fieldDiffs: ProtoFieldDiffEntry[];
};

export type EnumValueDiffEntry = {
    valueName: string;
    change: ChangeKind;
    before?: ProtoEnumValue;
    after?: ProtoEnumValue;
};

export type ProtobufEnumDiff = {
    key: string;
    file: string;
    name: string;
    change: ChangeKind;
    valueDiffs: EnumValueDiffEntry[];
};

export type ProtobufDiff = {
    messages: ProtobufMessageDiff[];
    enums: ProtobufEnumDiff[];
};

function fieldsEqual(a: ProtoField, b: ProtoField): boolean {
    return (
        a.number === b.number &&
        a.label === b.label &&
        a.type === b.type &&
        a.defaultValue === b.defaultValue
    );
}

function diffFields(
    before: ProtoField[],
    after: ProtoField[],
): ProtoFieldDiffEntry[] {
    const beforeByName = new Map(before.map((f) => [f.name, f]));
    const afterByName = new Map(after.map((f) => [f.name, f]));
    const diffs: ProtoFieldDiffEntry[] = [];

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

function diffValues(
    before: ProtoEnumValue[],
    after: ProtoEnumValue[],
): EnumValueDiffEntry[] {
    const beforeByName = new Map(before.map((v) => [v.name, v]));
    const afterByName = new Map(after.map((v) => [v.name, v]));
    const diffs: EnumValueDiffEntry[] = [];

    for (const [valueName, value] of beforeByName) {
        if (!afterByName.has(valueName)) {
            diffs.push({ valueName, change: "removed", before: value });
        }
    }
    for (const [valueName, value] of afterByName) {
        const prev = beforeByName.get(valueName);
        if (!prev) {
            diffs.push({ valueName, change: "added", after: value });
        } else if (prev.value !== value.value) {
            diffs.push({
                valueName,
                change: "changed",
                before: prev,
                after: value,
            });
        }
    }
    return diffs;
}

const CHANGE_ORDER: Record<ChangeKind, number> = {
    added: 0,
    removed: 1,
    changed: 2,
};

const byChangeThenName = (
    x: { change: ChangeKind; name: string },
    y: { change: ChangeKind; name: string },
) =>
    CHANGE_ORDER[x.change] - CHANGE_ORDER[y.change] ||
    x.name.localeCompare(y.name);

export function computeProtobufDiff(
    before: ProtobufDump,
    after: ProtobufDump,
): ProtobufDiff {
    const beforeMessages = new Map<
        string,
        { file: string; fields: ProtoField[] }
    >();
    const afterMessages = new Map<
        string,
        { file: string; fields: ProtoField[] }
    >();
    const beforeEnums = new Map<
        string,
        { file: string; values: ProtoEnumValue[] }
    >();
    const afterEnums = new Map<
        string,
        { file: string; values: ProtoEnumValue[] }
    >();

    for (const file of before.files) {
        for (const m of file.messages) {
            beforeMessages.set(`${file.fileName}::${m.name}`, {
                file: file.fileName,
                fields: m.fields,
            });
        }
        for (const e of file.enums) {
            beforeEnums.set(`${file.fileName}::${e.name}`, {
                file: file.fileName,
                values: e.values,
            });
        }
    }
    for (const file of after.files) {
        for (const m of file.messages) {
            afterMessages.set(`${file.fileName}::${m.name}`, {
                file: file.fileName,
                fields: m.fields,
            });
        }
        for (const e of file.enums) {
            afterEnums.set(`${file.fileName}::${e.name}`, {
                file: file.fileName,
                values: e.values,
            });
        }
    }

    const messages: ProtobufMessageDiff[] = [];
    for (const key of new Set([
        ...beforeMessages.keys(),
        ...afterMessages.keys(),
    ])) {
        const b = beforeMessages.get(key);
        const a = afterMessages.get(key);
        const name = key.split("::").slice(1).join("::");

        if (b && !a) {
            messages.push({
                key,
                file: b.file,
                name,
                change: "removed",
                fieldDiffs: diffFields(b.fields, []),
            });
        } else if (a && !b) {
            messages.push({
                key,
                file: a.file,
                name,
                change: "added",
                fieldDiffs: diffFields([], a.fields),
            });
        } else if (a && b) {
            const fieldDiffs = diffFields(b.fields, a.fields);
            if (fieldDiffs.length > 0) {
                messages.push({
                    key,
                    file: a.file,
                    name,
                    change: "changed",
                    fieldDiffs,
                });
            }
        }
    }

    const enums: ProtobufEnumDiff[] = [];
    for (const key of new Set([...beforeEnums.keys(), ...afterEnums.keys()])) {
        const b = beforeEnums.get(key);
        const a = afterEnums.get(key);
        const name = key.split("::").slice(1).join("::");

        if (b && !a) {
            enums.push({
                key,
                file: b.file,
                name,
                change: "removed",
                valueDiffs: diffValues(b.values, []),
            });
        } else if (a && !b) {
            enums.push({
                key,
                file: a.file,
                name,
                change: "added",
                valueDiffs: diffValues([], a.values),
            });
        } else if (a && b) {
            const valueDiffs = diffValues(b.values, a.values);
            if (valueDiffs.length > 0) {
                enums.push({
                    key,
                    file: a.file,
                    name,
                    change: "changed",
                    valueDiffs,
                });
            }
        }
    }

    messages.sort(byChangeThenName);
    enums.sort(byChangeThenName);

    return { messages, enums };
}
