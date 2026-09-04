import { NextResponse, type NextRequest } from "next/server";
import { getGame } from "@/lib/schema/games";
import { getSchemaDump } from "@/lib/schema/dump";
import { getConvarsDump } from "@/lib/convars/dump";
import { getProtobufDump } from "@/lib/protobuf/dump";
import { getEntitiesDump } from "@/lib/entities/dump";
import { getGameEventsDump } from "@/lib/gameevents/dump";
import { getDocsMeta } from "@/lib/docs/dump";
import { flattenDocsMetaWithTitles } from "@/lib/docs/tree";
import { getApiDump } from "@/lib/api-docs/dump";
import { apiDocsHref, buildFlatSequence } from "@/lib/api-docs/tree";
import type {
    GlobalSearchGroup,
    GlobalSearchItem,
    GlobalSearchResponse,
} from "@/lib/search/query";

const MAX_PER_GROUP = 5;

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const game = gameId ? getGame(gameId) : undefined;

    if (!game || !gameId) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!q) {
        return NextResponse.json({ groups: [] } satisfies GlobalSearchResponse);
    }

    const schemaGroup = async (): Promise<GlobalSearchGroup> => {
        const dump = await getSchemaDump(gameId);
        const items: GlobalSearchItem[] = dump.classes
            .filter((c) => c.name.toLowerCase().includes(q))
            .map((c) => ({
                label: c.name,
                sublabel: c.project,
                href: `/schema-viewer/${gameId}/${c.project}/${encodeURIComponent(c.name)}`,
            }));
        return { source: "schema", total: items.length, items: items.slice(0, MAX_PER_GROUP) };
    };

    const convarsGroup = async (): Promise<GlobalSearchGroup> => {
        const dump = await getConvarsDump(gameId);
        const items: GlobalSearchItem[] = [
            ...dump.convars
                .filter((c) => c.name.toLowerCase().includes(q))
                .map((c) => ({
                    label: c.name,
                    sublabel: c.module,
                    href: `/convars-viewer/${gameId}/${c.module}/${encodeURIComponent(c.name)}`,
                })),
            ...dump.commands
                .filter((c) => c.name.toLowerCase().includes(q))
                .map((c) => ({
                    label: c.name,
                    sublabel: c.module,
                    href: `/convars-viewer/${gameId}/${c.module}/${encodeURIComponent(c.name)}`,
                })),
        ];
        return { source: "convars", total: items.length, items: items.slice(0, MAX_PER_GROUP) };
    };

    const protobufGroup = async (): Promise<GlobalSearchGroup> => {
        const dump = await getProtobufDump(gameId);
        const items: GlobalSearchItem[] = [];
        for (const file of dump.files) {
            for (const message of file.messages) {
                if (message.name.toLowerCase().includes(q)) {
                    items.push({
                        label: message.name,
                        sublabel: file.fileName,
                        href: `/protobuf-viewer/${gameId}/${encodeURIComponent(file.fileName)}/${encodeURIComponent(message.name)}`,
                    });
                }
            }
            for (const protoEnum of file.enums) {
                if (protoEnum.name.toLowerCase().includes(q)) {
                    items.push({
                        label: protoEnum.name,
                        sublabel: file.fileName,
                        href: `/protobuf-viewer/${gameId}/${encodeURIComponent(file.fileName)}/${encodeURIComponent(protoEnum.name)}`,
                    });
                }
            }
        }
        return { source: "protobuf", total: items.length, items: items.slice(0, MAX_PER_GROUP) };
    };

    const entitiesGroup = async (): Promise<GlobalSearchGroup> => {
        const dump = await getEntitiesDump(gameId);
        const items: GlobalSearchItem[] = dump.entityClasses
            .filter((c) => c.class_name.toLowerCase().includes(q))
            .map((c) => ({
                label: c.class_name,
                href: `/entity-viewer/${gameId}/${encodeURIComponent(c.class_name)}`,
            }));
        return { source: "entities", total: items.length, items: items.slice(0, MAX_PER_GROUP) };
    };

    const gameeventsGroup = async (): Promise<GlobalSearchGroup> => {
        const dump = await getGameEventsDump(gameId);
        const items: GlobalSearchItem[] = dump.events
            .filter((e) => e.name.toLowerCase().includes(q))
            .map((e) => ({
                label: e.name,
                href: `/gameevents-viewer/${gameId}/${encodeURIComponent(e.name)}`,
            }));
        return { source: "gameevents", total: items.length, items: items.slice(0, MAX_PER_GROUP) };
    };

    const docsItems = async (): Promise<{ total: number; items: GlobalSearchItem[] }> => {
        const meta = await getDocsMeta();
        const entries = flattenDocsMetaWithTitles(meta);
        const matches = entries
            .filter((e) => e.title.toLowerCase().includes(q))
            .map((e) => ({ label: e.title, href: `/docs/${e.slug}` }));
        return { total: matches.length, items: matches };
    };

    const apiDocsItems = async (): Promise<{ total: number; items: GlobalSearchItem[] }> => {
        const dump = await getApiDump("stable");
        const flat = buildFlatSequence(dump);
        const matches = flat
            .filter((e) => e.label.toLowerCase().includes(q))
            .map((e) => ({
                label: e.label,
                sublabel: "api",
                href: apiDocsHref("stable", e.categorySlug, e.typeSlug),
            }));
        return { total: matches.length, items: matches };
    };

    const [
        schemaResult,
        convarsResult,
        protobufResult,
        entitiesResult,
        gameeventsResult,
        docsResult,
        apiDocsResult,
    ] = await Promise.allSettled([
        schemaGroup(),
        convarsGroup(),
        protobufGroup(),
        entitiesGroup(),
        gameeventsGroup(),
        docsItems(),
        apiDocsItems(),
    ]);

    const groups: GlobalSearchGroup[] = [];
    const emptyGroup = (
        source: GlobalSearchGroup["source"],
    ): GlobalSearchGroup => ({ source, total: 0, items: [] });

    groups.push(
        schemaResult.status === "fulfilled" ? schemaResult.value : emptyGroup("schema"),
    );
    groups.push(
        convarsResult.status === "fulfilled" ? convarsResult.value : emptyGroup("convars"),
    );
    groups.push(
        protobufResult.status === "fulfilled" ? protobufResult.value : emptyGroup("protobuf"),
    );
    groups.push(
        entitiesResult.status === "fulfilled" ? entitiesResult.value : emptyGroup("entities"),
    );
    groups.push(
        gameeventsResult.status === "fulfilled"
            ? gameeventsResult.value
            : emptyGroup("gameevents"),
    );

    const docsPart =
        docsResult.status === "fulfilled" ? docsResult.value : { total: 0, items: [] };
    const apiDocsPart =
        apiDocsResult.status === "fulfilled"
            ? apiDocsResult.value
            : { total: 0, items: [] };
    groups.push({
        source: "docs",
        total: docsPart.total + apiDocsPart.total,
        items: [...docsPart.items, ...apiDocsPart.items].slice(0, MAX_PER_GROUP),
    });

    return NextResponse.json({ groups } satisfies GlobalSearchResponse);
}
