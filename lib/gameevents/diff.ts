import type { GameEventField } from "@/lib/gameevents/parser";
import type { GameEventsDump } from "@/lib/gameevents/types";

export type ChangeKind = "added" | "removed" | "changed";

export type GameEventFieldDiffEntry = {
    fieldName: string;
    change: ChangeKind;
    before?: GameEventField;
    after?: GameEventField;
};

export type GameEventDiff = {
    key: string;
    name: string;
    change: ChangeKind;
    commentChanged: boolean;
    beforeComment?: string;
    afterComment?: string;
    fieldDiffs: GameEventFieldDiffEntry[];
};

export type GameEventsDiff = {
    events: GameEventDiff[];
};

function fieldsEqual(a: GameEventField, b: GameEventField): boolean {
    return a.type === b.type && a.comment === b.comment;
}

function diffFields(
    before: GameEventField[],
    after: GameEventField[],
): GameEventFieldDiffEntry[] {
    const beforeByName = new Map(before.map((f) => [f.name, f]));
    const afterByName = new Map(after.map((f) => [f.name, f]));
    const diffs: GameEventFieldDiffEntry[] = [];

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

export function computeGameEventsDiff(
    before: GameEventsDump,
    after: GameEventsDump,
): GameEventsDiff {
    const beforeByName = new Map(before.events.map((e) => [e.name, e]));
    const afterByName = new Map(after.events.map((e) => [e.name, e]));
    const names = new Set([...beforeByName.keys(), ...afterByName.keys()]);

    const events: GameEventDiff[] = [];
    for (const name of names) {
        const b = beforeByName.get(name);
        const a = afterByName.get(name);

        if (b && !a) {
            events.push({
                key: name,
                name,
                change: "removed",
                commentChanged: false,
                fieldDiffs: diffFields(b.fields, []),
            });
            continue;
        }
        if (a && !b) {
            events.push({
                key: name,
                name,
                change: "added",
                commentChanged: false,
                fieldDiffs: diffFields([], a.fields),
            });
            continue;
        }
        if (a && b) {
            const fieldDiffs = diffFields(b.fields, a.fields);
            const commentChanged = b.comment !== a.comment;
            if (fieldDiffs.length > 0 || commentChanged) {
                events.push({
                    key: name,
                    name,
                    change: "changed",
                    commentChanged,
                    beforeComment: b.comment,
                    afterComment: a.comment,
                    fieldDiffs,
                });
            }
        }
    }

    events.sort(byChangeThenName);
    return { events };
}
