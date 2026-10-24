export type Feature = {
    id: string;
    title: string;
    summary: string;
};

export type FeatureGroup = {
    id: string;
    title: string;
    blurb: string;
    features: Feature[];
};

export const featureStats = [
    { value: "7,500+", label: "generated schema files" },
    { value: "1,600+", label: "protobuf message types" },
    { value: "550+", label: "typed game event files" },
    { value: "30", label: "bundled translations" },
    { value: "66", label: "signatures in gamedata" },
    { value: "320+", label: "fix commits to v1.5.0" },
];

export const featureGroups: FeatureGroup[] = [
    {
        id: "framework",
        title: "Plugin framework",
        blurb: "How plugins are built, loaded, configured and wired together.",
        features: [
            {
                id: "plugins",
                title: "Plugin lifecycle & hot reload",
                summary:
                    "Plugins are plain C# classes that derive from BasePlugin. The framework hands each one an ISwiftlyCore with every service attached.",
            },
            {
                id: "shared-interfaces",
                title: "Shared interfaces between plugins",
                summary:
                    "Plugins can publish an interface under a string key and consume interfaces from other plugins without referencing their assemblies at runtime.",
            },
            {
                id: "configuration",
                title: "Configuration & dependency injection",
                summary:
                    "Typed configuration files in JSONC or TOML, created from your model on first run and live-reloaded when edited.",
            },
            {
                id: "threading",
                title: "Threading & async",
                summary:
                    "Game state is only safe on the game thread. The API gives you an async twin for most calls so you can await without blocking the server.",
            },
        ],
    },
    {
        id: "gameplay",
        title: "Gameplay APIs",
        blurb: "Talk to players, entities and the match.",
        features: [
            {
                id: "commands",
                title: "Commands",
                summary:
                    "Console and chat commands from a single attribute, with aliases, permissions and prefix handling.",
            },
            {
                id: "game-events",
                title: "Typed game events",
                summary:
                    "Every native game event has a generated class with typed fields, so there are no string keys or casts.",
            },
            {
                id: "engine-events",
                title: "Engine events",
                summary:
                    "Framework-level events for the server, clients and entities, as C# events or attributes.",
            },
            {
                id: "players",
                title: "Players & messaging",
                summary:
                    "A rich IPlayer wrapper plus a player manager for queries, targeting and broadcasting.",
            },
            {
                id: "entities",
                title: "Entity system & schemas",
                summary:
                    "Create, query, mutate and hook any entity through generated, typed schema classes.",
            },
            {
                id: "game-hooks",
                title: "Native game hooks",
                summary:
                    "Pre and post hooks on engine functions, with mutable parameter structs.",
            },
            {
                id: "tracing",
                title: "Collision tracing",
                summary:
                    "Ray, hull and player-bounds traces through the engine with a fluent builder and an entity filter callback.",
            },
            {
                id: "scheduler",
                title: "Scheduler & timers",
                summary:
                    "Tick-based and wall-clock timers that you can cancel, plus helpers to run work on the next tick or world update.",
            },
            {
                id: "sounds",
                title: "Sound events",
                summary:
                    "Create and emit native sound events to chosen recipients.",
            },
        ],
    },
    {
        id: "menus",
        title: "Menus",
        blurb: "A component-based menu framework with swappable renderers.",
        features: [
            {
                id: "menu-system",
                title: "Component menu framework",
                summary:
                    "Build menus by composing components, open them for one player or everyone, and render them with the center HUD or chat.",
            },
            {
                id: "custom-components",
                title: "Custom menu components",
                summary:
                    "Derive from MenuComponentBase to render your own nodes, hints, enabled state and per-session state.",
            },
        ],
    },
    {
        id: "engine",
        title: "Engine access",
        blurb: "Reach below the managed API when you need to.",
        features: [
            {
                id: "memory",
                title: "Memory, signatures & native hooks",
                summary:
                    "Find functions by signature, vtable or interface name, then call or hook them with a managed delegate.",
            },
            {
                id: "gamedata",
                title: "Gamedata: signatures, offsets & patches",
                summary:
                    "Engine addresses live in JSONC files, per platform, so a game update is a data change rather than a rebuild.",
            },
            {
                id: "net-messages",
                title: "Protobuf net messages",
                summary:
                    "Send, receive and rewrite the game's network messages with generated, typed protobuf classes.",
            },
            {
                id: "string-tables",
                title: "String tables",
                summary:
                    "Find and edit Source 2 network string tables by name or id.",
            },
            {
                id: "convars",
                title: "ConVars",
                summary:
                    "Typed console variables: find, create, replicate and watch.",
            },
            {
                id: "extensions",
                title: "Native extensions",
                summary:
                    "Load C++ extensions at runtime and share raw pointers between extensions and managed code.",
            },
            {
                id: "steam",
                title: "Steamworks",
                summary:
                    "Generated Steamworks bindings with a callback dispatcher, ready once the Steam API activates.",
            },
        ],
    },
    {
        id: "data",
        title: "Data, access & localization",
        blurb: "Storage, permissions and languages.",
        features: [
            {
                id: "database",
                title: "Database connections",
                summary:
                    "Connections are named once in database.jsonc and shared by every plugin, so credentials live in one place.",
            },
            {
                id: "permissions",
                title: "Permissions",
                summary:
                    "Per-player permissions with groups, inheritance and wildcards, usable straight from command attributes.",
            },
            {
                id: "translations",
                title: "Translations & localization",
                summary:
                    "Per-player languages, 30 bundled core translations and a localizer you can index like a dictionary.",
            },
        ],
    },
    {
        id: "ops",
        title: "Operations & tooling",
        blurb: "Everything around running and building on a server.",
        features: [
            {
                id: "profiler",
                title: "Profiler",
                summary:
                    "Record named sections from your plugin and capture .NET EventPipe traces, then turn them into a readable summary.",
            },
            {
                id: "core-config",
                title: "Server configuration",
                summary:
                    "One core.jsonc controls logging, prefixes, menus, Steam auth and crash handling.",
            },
            {
                id: "console",
                title: "The sw console command",
                summary: "Manage the framework from the server console.",
            },
            {
                id: "tooling",
                title: "Templates, packages & builds",
                summary:
                    "Start a plugin in a minute and build the core yourself.",
            },
        ],
    },
];
