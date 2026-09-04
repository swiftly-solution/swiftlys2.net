// lib/search/filter-config.ts
export type ViewerId =
    | "schema"
    | "convars"
    | "protobuf"
    | "entities"
    | "gameevents";

export type FilterKeyInfo = {
    key: string;
    description: string;
    example: string;
};

export const VIEWER_HREF: Record<ViewerId, string> = {
    schema: "/schema-viewer",
    convars: "/convars-viewer",
    protobuf: "/protobuf-viewer",
    entities: "/entity-viewer",
    gameevents: "/gameevents-viewer",
};

export const VIEWER_FILTER_KEYS: Record<ViewerId, FilterKeyInfo[]> = {
    schema: [
        {
            key: "module",
            description: "Filter by project name",
            example: "module:client",
        },
        {
            key: "kind",
            description: "Filter by class or enum",
            example: "kind:enum",
        },
        {
            key: "field",
            description: "Filter by field name",
            example: "field:m_flags",
        },
        {
            key: "type",
            description: "Filter by field type",
            example: "type:CBaseEntity",
        },
        {
            key: "offset",
            description: "Filter by byte offset",
            example: "offset:0x1A0",
        },
        {
            key: "enumvalue",
            description: "Filter by enum member value",
            example: "enumvalue:4",
        },
        {
            key: "networked",
            description: "Filter by whether a field is networked",
            example: "networked:true",
        },
    ],
    convars: [
        {
            key: "module",
            description: "Filter by module name",
            example: "module:client",
        },
        {
            key: "kind",
            description: "Filter by convar or concommand",
            example: "kind:concommand",
        },
        {
            key: "flag",
            description: "Filter by flag",
            example: "flag:FCVAR_CHEAT",
        },
        {
            key: "attr",
            description: "Filter by attribute",
            example: "attr:has_callback",
        },
    ],
    protobuf: [
        {
            key: "module",
            description: "Filter by module name",
            example: "module:usermessages",
        },
        {
            key: "kind",
            description: "Filter by message or enum",
            example: "kind:message",
        },
        {
            key: "file",
            description: "Filter by proto file",
            example: "file:netmessages.proto",
        },
    ],
    entities: [
        {
            key: "kind",
            description: "Filter by input, output or member",
            example: "kind:member",
        },
        {
            key: "field",
            description: "Filter by field name",
            example: "field:m_health",
        },
    ],
    gameevents: [
        {
            key: "file",
            description: "Filter by gameevents file",
            example: "file:core.gameevents",
        },
        {
            key: "field",
            description: "Filter by event field name",
            example: "field:userid",
        },
    ],
};
