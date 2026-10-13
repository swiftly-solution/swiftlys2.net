import { DEFAULT_GAME_ID } from "@/lib/schema/games";
import { getSchemaDump } from "@/lib/schema/dump";
import { buildNameIndex } from "@/lib/schema/queries";
import { getEntitiesDump } from "@/lib/entities/dump";
import { findEntityEntry } from "@/lib/entities/queries";
import { getProtobufDump } from "@/lib/protobuf/dump";
import {
    buildProtobufTypeIndex,
    resolveProtobufType,
} from "@/lib/protobuf/queries";
import { getGameEventsDump } from "@/lib/gameevents/dump";
import { findGameEvent } from "@/lib/gameevents/queries";
import { getConvarsDump } from "@/lib/convars/dump";
import { getApiDump } from "@/lib/api-docs/dump";
import { apiDocsHref, slugify } from "@/lib/api-docs/tree";
import type { ApiBranch, ApiDump, ApiType } from "@/lib/api-docs/types";

export type DocRef = { href: string; label: string };

const PREFERRED_SCHEMA_PROJECT = "server";

export async function resolveSchemaRef(
    name: string,
    game: string = DEFAULT_GAME_ID,
): Promise<DocRef | null> {
    try {
        const dump = await getSchemaDump(game);
        const links = buildNameIndex(dump).get(name);
        if (!links || links.length === 0) return null;
        const link =
            links.find((l) => l.project === PREFERRED_SCHEMA_PROJECT) ??
            links[0];
        return {
            href: `/schema-viewer/${game}/${encodeURIComponent(link.project)}/${encodeURIComponent(name)}`,
            label: name,
        };
    } catch {
        return null;
    }
}

export async function resolveEntityRef(
    className: string,
    game: string = DEFAULT_GAME_ID,
): Promise<DocRef | null> {
    try {
        const dump = await getEntitiesDump(game);
        if (!findEntityEntry(dump, className)) return null;
        return {
            href: `/entity-viewer/${game}/${encodeURIComponent(className)}`,
            label: className,
        };
    } catch {
        return null;
    }
}

export async function resolveProtobufRef(
    name: string,
    game: string = DEFAULT_GAME_ID,
): Promise<DocRef | null> {
    try {
        const dump = await getProtobufDump(game);
        const link = resolveProtobufType(buildProtobufTypeIndex(dump), name);
        if (!link) return null;
        return {
            href: `/protobuf-viewer/${game}/${encodeURIComponent(link.file)}/${encodeURIComponent(link.name)}`,
            label: name,
        };
    } catch {
        return null;
    }
}

export async function resolveGameEventRef(
    name: string,
    game: string = DEFAULT_GAME_ID,
): Promise<DocRef | null> {
    try {
        const dump = await getGameEventsDump(game);
        if (!findGameEvent(dump, name)) return null;
        return {
            href: `/gameevents-viewer/${game}/${encodeURIComponent(name)}`,
            label: name,
        };
    } catch {
        return null;
    }
}

export async function resolveConvarRef(
    name: string,
    game: string = DEFAULT_GAME_ID,
): Promise<DocRef | null> {
    try {
        const dump = await getConvarsDump(game);
        const entry =
            dump.convars.find((c) => c.name === name) ??
            dump.commands.find((c) => c.name === name);
        if (!entry) return null;
        return {
            href: `/convars-viewer/${game}/${encodeURIComponent(entry.module)}/${encodeURIComponent(name)}`,
            label: name,
        };
    } catch {
        return null;
    }
}

const MEMBER_LISTS = [
    "operators",
    "constructors",
    "methods",
    "properties",
    "fields",
] as const satisfies readonly (keyof ApiType)[];

const API_BRANCH_ORDER: readonly ApiBranch[] = ["stable", "beta"];

type ApiEntry = { categorySlug: string; typeSlug: string; type: ApiType };
const apiIndexCache = new WeakMap<ApiDump, Map<string, ApiEntry>>();

function getApiIndex(dump: ApiDump): Map<string, ApiEntry> {
    let index = apiIndexCache.get(dump);
    if (index) return index;
    index = new Map();
    for (const category of dump.categories) {
        const categorySlug = slugify(category.category);
        for (const type of category.types) {
            if (!index.has(type.name)) {
                index.set(type.name, {
                    categorySlug,
                    typeSlug: slugify(type.name),
                    type,
                });
            }
        }
    }
    apiIndexCache.set(dump, index);
    return index;
}

async function resolveApiRefInBranch(
    branch: ApiBranch,
    name: string,
    member?: string,
): Promise<DocRef | null> {
    try {
        const entry = getApiIndex(await getApiDump(branch)).get(name);
        if (!entry) return null;

        let anchor = "";
        if (member) {
            for (const key of MEMBER_LISTS) {
                const found = entry.type[key]?.find(
                    (m) => m.name.toLowerCase() === member.toLowerCase(),
                );
                if (found) {
                    anchor = `#${found.uid
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "")}`;
                    break;
                }
            }
        }

        return {
            href: `${apiDocsHref(branch, entry.categorySlug, entry.typeSlug)}${anchor}`,
            label: member ? `${name}.${member}` : name,
        };
    } catch {
        return null;
    }
}

export async function resolveApiRef(
    name: string,
    member?: string,
): Promise<DocRef | null> {
    for (const branch of API_BRANCH_ORDER) {
        const ref = await resolveApiRefInBranch(branch, name, member);
        if (ref) return ref;
    }
    return null;
}
