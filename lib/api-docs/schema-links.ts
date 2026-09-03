import type { SchemaDump } from "@/lib/schema/types";
import { buildNameIndex } from "@/lib/schema/queries";

const SCHEMA_DEFS_PREFIX = "SwiftlyS2.Shared.SchemaDefinitions.";

export const SCHEMA_LINK_GAME = "cs2";

export type SchemaProjectIndex = Map<string, string>;

export function schemaClassName(uid?: string, url?: string): string | null {
    for (const value of [uid, url]) {
        if (!value) continue;
        const withoutExt = value.replace(/\.html$/, "");
        if (withoutExt.startsWith(SCHEMA_DEFS_PREFIX)) {
            const name = withoutExt.slice(SCHEMA_DEFS_PREFIX.length);
            if (name && !name.includes(".")) return name;
        }
    }
    return null;
}

const PREFERRED_PROJECT = "server";

export function buildSchemaProjectIndex(dump: SchemaDump): SchemaProjectIndex {
    const index: SchemaProjectIndex = new Map();
    for (const [name, links] of buildNameIndex(dump)) {
        if (links.length === 0) continue;
        const preferred = links.find((l) => l.project === PREFERRED_PROJECT);
        index.set(name, (preferred ?? links[0]).project);
    }
    return index;
}

export function schemaViewerHref(className: string, project: string): string {
    return `/schema-viewer/${SCHEMA_LINK_GAME}/${project}/${encodeURIComponent(className)}`;
}

export function resolveSchemaLink(
    schemaIndex: SchemaProjectIndex,
    uid?: string,
    url?: string,
): string | null {
    const name = schemaClassName(uid, url);
    if (!name) return null;
    const project = schemaIndex.get(name);
    return project ? schemaViewerHref(name, project) : null;
}
