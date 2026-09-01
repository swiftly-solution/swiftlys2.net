import type { ConCommand, ConVar, ConvarsDump } from "@/lib/convars/types";

export type ChangeKind = "added" | "removed" | "changed";

export type ConVarDiff = {
    key: string;
    module: string;
    name: string;
    change: ChangeKind;
    before?: ConVar;
    after?: ConVar;
};

export type ConCommandDiff = {
    key: string;
    module: string;
    name: string;
    change: ChangeKind;
    before?: ConCommand;
    after?: ConCommand;
};

export type ConvarsDiff = {
    convars: ConVarDiff[];
    commands: ConCommandDiff[];
};

function keyOf(module: string, name: string): string {
    return `${module}::${name}`;
}

function sortedFlags(flags: string[]): string[] {
    return [...flags].sort();
}

function convarsEqual(a: ConVar, b: ConVar): boolean {
    return (
        a.description === b.description &&
        a.default === b.default &&
        a.min === b.min &&
        a.max === b.max &&
        JSON.stringify(sortedFlags(a.flags)) ===
            JSON.stringify(sortedFlags(b.flags)) &&
        JSON.stringify(a.attributes) === JSON.stringify(b.attributes)
    );
}

function commandsEqual(a: ConCommand, b: ConCommand): boolean {
    return (
        a.description === b.description &&
        JSON.stringify(sortedFlags(a.flags)) ===
            JSON.stringify(sortedFlags(b.flags)) &&
        JSON.stringify(a.attributes) === JSON.stringify(b.attributes)
    );
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

export function computeConvarsDiff(
    before: ConvarsDump,
    after: ConvarsDump,
): ConvarsDiff {
    const beforeConvars = new Map(
        before.convars.map((c) => [keyOf(c.module, c.name), c]),
    );
    const afterConvars = new Map(
        after.convars.map((c) => [keyOf(c.module, c.name), c]),
    );
    const convarKeys = new Set([
        ...beforeConvars.keys(),
        ...afterConvars.keys(),
    ]);

    const convars: ConVarDiff[] = [];
    for (const key of convarKeys) {
        const b = beforeConvars.get(key);
        const a = afterConvars.get(key);

        if (b && !a) {
            convars.push({
                key,
                module: b.module,
                name: b.name,
                change: "removed",
                before: b,
            });
        } else if (a && !b) {
            convars.push({
                key,
                module: a.module,
                name: a.name,
                change: "added",
                after: a,
            });
        } else if (a && b && !convarsEqual(a, b)) {
            convars.push({
                key,
                module: a.module,
                name: a.name,
                change: "changed",
                before: b,
                after: a,
            });
        }
    }

    const beforeCommands = new Map(
        before.commands.map((c) => [keyOf(c.module, c.name), c]),
    );
    const afterCommands = new Map(
        after.commands.map((c) => [keyOf(c.module, c.name), c]),
    );
    const commandKeys = new Set([
        ...beforeCommands.keys(),
        ...afterCommands.keys(),
    ]);

    const commands: ConCommandDiff[] = [];
    for (const key of commandKeys) {
        const b = beforeCommands.get(key);
        const a = afterCommands.get(key);

        if (b && !a) {
            commands.push({
                key,
                module: b.module,
                name: b.name,
                change: "removed",
                before: b,
            });
        } else if (a && !b) {
            commands.push({
                key,
                module: a.module,
                name: a.name,
                change: "added",
                after: a,
            });
        } else if (a && b && !commandsEqual(a, b)) {
            commands.push({
                key,
                module: a.module,
                name: a.name,
                change: "changed",
                before: b,
                after: a,
            });
        }
    }

    convars.sort(byChangeThenName);
    commands.sort(byChangeThenName);

    return { convars, commands };
}
