import type { GameEventEntry, GameEventsDump } from "@/lib/gameevents/types";

export type GameEventFileGroupEntry = {
    file: string;
    items: { name: string; fieldCount: number }[];
};

export function buildGameEventFileIndex(
    dump: GameEventsDump,
): GameEventFileGroupEntry[] {
    const byFile = new Map<string, { name: string; fieldCount: number }[]>();

    for (const ev of dump.events) {
        for (const file of ev.files) {
            let list = byFile.get(file);
            if (!list) {
                list = [];
                byFile.set(file, list);
            }
            list.push({ name: ev.name, fieldCount: ev.fields.length });
        }
    }

    return Array.from(byFile.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([file, items]) => ({
            file,
            items: items.sort((a, b) => a.name.localeCompare(b.name)),
        }));
}

export function findGameEvent(
    dump: GameEventsDump,
    name: string,
): GameEventEntry | null {
    return dump.events.find((e) => e.name === name) ?? null;
}
