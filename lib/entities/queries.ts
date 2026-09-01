import type { Datamap, EntitiesDump, EntityClass } from "@/lib/entities/types";

export type EntityIndexEntry = { name: string };

export function buildEntityIndex(dump: EntitiesDump): EntityIndexEntry[] {
    return dump.datamaps
        .map((m) => ({ name: m.class_name }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

export type FoundEntity = {
    datamap: Datamap;
    entityClass: EntityClass | null;
};

export function findEntityEntry(
    dump: EntitiesDump,
    className: string,
): FoundEntity | null {
    const datamap = dump.datamaps.find((m) => m.class_name === className);
    if (!datamap) return null;

    const entityClass =
        dump.entityClasses.find((e) => e.class_name === className) ?? null;
    return { datamap, entityClass };
}

export function hasDatamap(dump: EntitiesDump, className: string): boolean {
    return dump.datamaps.some((m) => m.class_name === className);
}
