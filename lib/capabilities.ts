export type CapabilityCategory =
    "Core" | "Menus" | "Networking" | "Database" | "Hooks" | "Media";

export type Capability = {
    title: string;
    description: string;
    category: CapabilityCategory;
};

export const capabilityCategories: CapabilityCategory[] = [
    "Core",
    "Menus",
    "Networking",
    "Database",
    "Hooks",
    "Media",
];

export const capabilities: Capability[] = [
    {
        title: "Console & chat commands",
        description:
            "Register console commands, chat commands, and hook client command execution with typed argument parsing.",
        category: "Core",
    },
    {
        title: "CVar management",
        description:
            "Find or create typed console variables with change callbacks.",
        category: "Core",
    },
    {
        title: "Entity system",
        description:
            "Query and manipulate entities, read keyvalues, and hook entity inputs and outputs.",
        category: "Core",
    },
    {
        title: "Source 2 internals",
        description:
            "Direct access to server info, the global variables struct, and map validation.",
        category: "Core",
    },
    {
        title: "Game data & signatures",
        description:
            "Resolve engine offsets and signatures declared in signatures.jsonc gamedata files.",
        category: "Core",
    },
    {
        title: "Match state",
        description:
            "Read and control live match data and the current game phase.",
        category: "Core",
    },
    {
        title: "Player management",
        description: "Query online status, player counts, and server capacity.",
        category: "Core",
    },
    {
        title: "Permissions",
        description: "Check wildcard-capable player permissions like admin.*.",
        category: "Core",
    },
    {
        title: "Translations & localization",
        description:
            "Serve per-player localized strings through the built-in translation service.",
        category: "Core",
    },
    {
        title: "Timers & scheduling",
        description:
            "Queue next-tick callbacks and delayed or repeating tasks off the game loop.",
        category: "Core",
    },
    {
        title: "Performance profiling",
        description:
            "Start and stop named profiling recordings to find hot paths in your plugin.",
        category: "Core",
    },
    {
        title: "Collision tracing",
        description:
            "Run engine hull and ray collision traces with custom filters.",
        category: "Core",
    },
    {
        title: "Hot reload",
        description:
            "Plugins are told when they've been hot-reloaded so state can survive a reload.",
        category: "Core",
    },
    {
        title: "Memory manipulation",
        description:
            "Resolve addresses by signature, vtable, or interface name, then call or hook them directly.",
        category: "Hooks",
    },
    {
        title: "Engine & entity hooks",
        description:
            "Hook controller, weapon, movement, pawn, entity, and datamap calls directly.",
        category: "Hooks",
    },
    {
        title: "Game event hooks",
        description:
            "Hook pre and post native game events with typed event objects.",
        category: "Hooks",
    },
    {
        title: "Tick & world hooks",
        description:
            "Subscribe to per-tick and world-update callbacks, hibernation-aware.",
        category: "Hooks",
    },
    {
        title: "Protobuf networking",
        description:
            "Hook and exchange fully typed protobuf network messages, both ways.",
        category: "Networking",
    },
    {
        title: "String tables",
        description:
            "Find and inspect Source 2 network string tables by name or ID.",
        category: "Networking",
    },
    {
        title: "Database connections",
        description:
            "Named MySQL, PostgreSQL, and SQLite connections resolved centrally and shared across plugins.",
        category: "Database",
    },
    {
        title: "Menu system",
        description:
            "Builder-pattern menus with configurable navigation, input mode, and buttons.",
        category: "Menus",
    },
    {
        title: "Audio playback",
        description:
            "Create and play native sound events for connected clients.",
        category: "Media",
    },
];
