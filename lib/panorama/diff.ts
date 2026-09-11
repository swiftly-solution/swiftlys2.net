import type { PanoramaDump } from "@/lib/panorama/types";

export type ChangeKind = "added" | "removed" | "changed";

export type PanoramaPropertyDiff = {
    key: string;
    name: string;
    change: ChangeKind;
    before?: string;
    after?: string;
};

export type PanoramaDiff = {
    properties: PanoramaPropertyDiff[];
};

const CHANGE_ORDER: Record<ChangeKind, number> = {
    added: 0,
    removed: 1,
    changed: 2,
};

export function computePanoramaDiff(
    before: PanoramaDump,
    after: PanoramaDump,
): PanoramaDiff {
    const beforeMap = new Map(before.properties.map((p) => [p.name, p]));
    const afterMap = new Map(after.properties.map((p) => [p.name, p]));
    const names = new Set([...beforeMap.keys(), ...afterMap.keys()]);

    const properties: PanoramaPropertyDiff[] = [];
    for (const name of names) {
        const b = beforeMap.get(name);
        const a = afterMap.get(name);

        if (b && !a) {
            properties.push({
                key: name,
                name,
                change: "removed",
                before: b.description,
            });
        } else if (a && !b) {
            properties.push({
                key: name,
                name,
                change: "added",
                after: a.description,
            });
        } else if (a && b && a.description !== b.description) {
            properties.push({
                key: name,
                name,
                change: "changed",
                before: b.description,
                after: a.description,
            });
        }
    }

    properties.sort(
        (x, y) =>
            CHANGE_ORDER[x.change] - CHANGE_ORDER[y.change] ||
            x.name.localeCompare(y.name),
    );

    return { properties };
}
