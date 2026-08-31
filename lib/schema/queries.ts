import type {
    SchemaClass,
    SchemaDump,
    SchemaEnum,
    SchemaKind,
} from "@/lib/schema/types";

export type ModuleIndexEntry = {
    project: string;
    items: { name: string; kind: SchemaKind }[];
};

export function buildModuleIndex(dump: SchemaDump): ModuleIndexEntry[] {
    const byProject = new Map<string, ModuleIndexEntry>();
    const seenPerProject = new Map<string, Set<string>>();

    const add = (project: string, name: string, kind: SchemaKind) => {
        let entry = byProject.get(project);
        if (!entry) {
            entry = { project, items: [] };
            byProject.set(project, entry);
            seenPerProject.set(project, new Set());
        }
        const key = `${kind}:${name}`;
        const seen = seenPerProject.get(project)!;
        if (seen.has(key)) return;
        seen.add(key);
        entry.items.push({ name, kind });
    };

    for (const c of dump.classes) add(c.project, c.name, "class");
    for (const e of dump.enums) add(e.project, e.name, "enum");

    const modules = Array.from(byProject.values());
    for (const m of modules) {
        m.items.sort((a, b) => a.name.localeCompare(b.name));
    }
    modules.sort((a, b) => a.project.localeCompare(b.project));
    return modules;
}

export type ResolvedLink = { project: string; kind: SchemaKind };

export function buildNameIndex(dump: SchemaDump): Map<string, ResolvedLink[]> {
    const index = new Map<string, ResolvedLink[]>();
    const seen = new Set<string>();

    const add = (name: string, link: ResolvedLink) => {
        const dedupeKey = `${name}|${link.project}|${link.kind}`;
        if (seen.has(dedupeKey)) return;
        seen.add(dedupeKey);

        const existing = index.get(name);
        if (existing) existing.push(link);
        else index.set(name, [link]);
    };

    for (const c of dump.classes) {
        add(c.name, { project: c.project, kind: "class" });
    }
    for (const e of dump.enums) {
        add(e.name, { project: e.project, kind: "enum" });
    }

    return index;
}

export function resolveLink(
    nameIndex: Map<string, ResolvedLink[]>,
    name: string,
    currentProject: string,
): ResolvedLink | null {
    const matches = nameIndex.get(name);
    if (!matches || matches.length === 0) return null;
    return matches.find((m) => m.project === currentProject) ?? matches[0];
}

export type Reference = {
    project: string;
    className: string;
    label: string;
};

export function findReferences(dump: SchemaDump, name: string): Reference[] {
    const refs: Reference[] = [];

    for (const c of dump.classes) {
        if (c.base_classes?.includes(name)) {
            refs.push({
                project: c.project,
                className: c.name,
                label: "base class",
            });
        }
        for (const field of c.fields ?? []) {
            if (field.type === name) {
                refs.push({
                    project: c.project,
                    className: c.name,
                    label: field.name,
                });
            }
        }
    }

    return refs;
}

export type FoundEntry =
    { kind: "class"; entry: SchemaClass } | { kind: "enum"; entry: SchemaEnum };

export function findEntry(
    dump: SchemaDump,
    project: string,
    name: string,
): FoundEntry | null {
    const cls = dump.classes.find(
        (c) => c.project === project && c.name === name,
    );
    if (cls) return { kind: "class", entry: cls };

    const en = dump.enums.find((e) => e.project === project && e.name === name);
    if (en) return { kind: "enum", entry: en };

    return null;
}
