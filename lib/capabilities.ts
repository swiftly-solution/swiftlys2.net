import {
    Terminal,
    SlidersHorizontal,
    Box,
    Layers,
    ScanSearch,
    Trophy,
    UserCog,
    KeyRound,
    Languages,
    Clock,
    Gauge,
    Radar,
    RefreshCw,
    Cpu,
    Gamepad2,
    Flag,
    Timer,
    Share2,
    Table,
    Database,
    LayoutTemplate,
    Volume2,
    type LucideIcon,
} from "lucide-react";

export type CapabilityCategory =
    "Core" | "Menus" | "Networking" | "Database" | "Hooks" | "Media";

export type Capability = {
    title: string;
    description: string;
    category: CapabilityCategory;
    icon: LucideIcon;
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
        icon: Terminal,
    },
    {
        title: "CVar management",
        description:
            "Find or create typed console variables with change callbacks.",
        category: "Core",
        icon: SlidersHorizontal,
    },
    {
        title: "Entity system",
        description:
            "Query and manipulate entities, read keyvalues, and hook entity inputs and outputs.",
        category: "Core",
        icon: Box,
    },
    {
        title: "Source 2 internals",
        description:
            "Direct access to server info, the global variables struct, and map validation.",
        category: "Core",
        icon: Layers,
    },
    {
        title: "Game data & signatures",
        description:
            "Resolve engine offsets and signatures declared in signatures.jsonc gamedata files.",
        category: "Core",
        icon: ScanSearch,
    },
    {
        title: "Match state",
        description:
            "Read and control live match data and the current game phase.",
        category: "Core",
        icon: Trophy,
    },
    {
        title: "Player management",
        description: "Query online status, player counts, and server capacity.",
        category: "Core",
        icon: UserCog,
    },
    {
        title: "Permissions",
        description: "Check wildcard-capable player permissions like admin.*.",
        category: "Core",
        icon: KeyRound,
    },
    {
        title: "Translations & localization",
        description:
            "Serve per-player localized strings through the built-in translation service.",
        category: "Core",
        icon: Languages,
    },
    {
        title: "Timers & scheduling",
        description:
            "Queue next-tick callbacks and delayed or repeating tasks off the game loop.",
        category: "Core",
        icon: Clock,
    },
    {
        title: "Performance profiling",
        description:
            "Start and stop named profiling recordings to find hot paths in your plugin.",
        category: "Core",
        icon: Gauge,
    },
    {
        title: "Collision tracing",
        description:
            "Run engine hull and ray collision traces with custom filters.",
        category: "Core",
        icon: Radar,
    },
    {
        title: "Hot reload",
        description:
            "Plugins are told when they've been hot-reloaded so state can survive a reload.",
        category: "Core",
        icon: RefreshCw,
    },
    {
        title: "Memory manipulation",
        description:
            "Resolve addresses by signature, vtable, or interface name, then call or hook them directly.",
        category: "Hooks",
        icon: Cpu,
    },
    {
        title: "Engine & entity hooks",
        description:
            "Hook controller, weapon, movement, pawn, entity, and datamap calls directly.",
        category: "Hooks",
        icon: Gamepad2,
    },
    {
        title: "Game event hooks",
        description:
            "Hook pre and post native game events with typed event objects.",
        category: "Hooks",
        icon: Flag,
    },
    {
        title: "Tick & world hooks",
        description:
            "Subscribe to per-tick and world-update callbacks, hibernation-aware.",
        category: "Hooks",
        icon: Timer,
    },
    {
        title: "Protobuf networking",
        description:
            "Hook and exchange fully typed protobuf network messages, both ways.",
        category: "Networking",
        icon: Share2,
    },
    {
        title: "String tables",
        description:
            "Find and inspect Source 2 network string tables by name or ID.",
        category: "Networking",
        icon: Table,
    },
    {
        title: "Database connections",
        description:
            "Named MySQL, PostgreSQL, and SQLite connections resolved centrally and shared across plugins.",
        category: "Database",
        icon: Database,
    },
    {
        title: "Menu system",
        description:
            "Builder-pattern menus with configurable navigation, input mode, and buttons.",
        category: "Menus",
        icon: LayoutTemplate,
    },
    {
        title: "Audio playback",
        description:
            "Create and play native sound events for connected clients.",
        category: "Media",
        icon: Volume2,
    },
];
