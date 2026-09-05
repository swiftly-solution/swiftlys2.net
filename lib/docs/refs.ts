import { DEFAULT_GAME_ID } from "@/lib/schema/games";
import { getSchemaDump } from "@/lib/schema/dump";
import { buildNameIndex } from "@/lib/schema/queries";
import { getEntitiesDump } from "@/lib/entities/dump";
import { findEntityEntry } from "@/lib/entities/queries";
import { getProtobufDump } from "@/lib/protobuf/dump";
import { buildProtobufTypeIndex, resolveProtobufType } from "@/lib/protobuf/queries";
import { getGameEventsDump } from "@/lib/gameevents/dump";
import { findGameEvent } from "@/lib/gameevents/queries";
import { getConvarsDump } from "@/lib/convars/dump";
import { getApiDump } from "@/lib/api-docs/dump";
import { apiDocsHref, buildNavTree, findType, isApiBranch } from "@/lib/api-docs/tree";
import type { ApiBranch, ApiType } from "@/lib/api-docs/types";

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

export async function resolveApiRef(
    name: string,
    branchInput?: string,
    member?: string,
): Promise<DocRef | null> {
    const branch: ApiBranch = isApiBranch(branchInput) ? branchInput : "stable";
    try {
        const dump = await getApiDump(branch);
        for (const category of buildNavTree(dump)) {
            const navType = category.types.find((t) => t.name === name);
            if (!navType) continue;

            let anchor = "";
            if (member) {
                const fullType = findType(dump, category.slug, navType.slug)?.type;
                for (const key of MEMBER_LISTS) {
                    const found = fullType?.[key]?.find(
                        (m) => m.name.toLowerCase() === member.toLowerCase(),
                    );
                    if (found) {
                        anchor = `#${found.uid.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
                        break;
                    }
                }
            }

            return {
                href: `${apiDocsHref(branch, category.slug, navType.slug)}${anchor}`,
                label: member ? `${name}.${member}` : name,
            };
        }
        return null;
    } catch {
        return null;
    }
}
