import type {
    ConCommand,
    ConVar,
    ConvarsDump,
    ConvarsKind,
} from "@/lib/convars/types";

export type ConvarsModuleIndexEntry = {
    module: string;
    items: { name: string; kind: ConvarsKind }[];
};

export function buildConvarsModuleIndex(
    dump: ConvarsDump,
): ConvarsModuleIndexEntry[] {
    const byModule = new Map<string, ConvarsModuleIndexEntry>();

    const add = (module: string, name: string, kind: ConvarsKind) => {
        let entry = byModule.get(module);
        if (!entry) {
            entry = { module, items: [] };
            byModule.set(module, entry);
        }
        entry.items.push({ name, kind });
    };

    for (const c of dump.convars) add(c.module, c.name, "convar");
    for (const c of dump.commands) add(c.module, c.name, "concommand");

    const modules = Array.from(byModule.values());
    for (const m of modules) {
        m.items.sort((a, b) => a.name.localeCompare(b.name));
    }
    modules.sort((a, b) => a.module.localeCompare(b.module));
    return modules;
}

export type FoundConvarsEntry =
    | { kind: "convar"; entry: ConVar }
    | { kind: "concommand"; entry: ConCommand };

export function findConvarsEntry(
    dump: ConvarsDump,
    module: string,
    name: string,
): FoundConvarsEntry | null {
    const convar = dump.convars.find(
        (c) => c.module === module && c.name === name,
    );
    if (convar) return { kind: "convar", entry: convar };

    const command = dump.commands.find(
        (c) => c.module === module && c.name === name,
    );
    if (command) return { kind: "concommand", entry: command };

    return null;
}
