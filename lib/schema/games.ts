export type Game = {
    id: string;
    name: string;
    icon: string;
    repoOwner: string;
    repoName: string;
    dumpPath: string;
    convarsPath: string;
    convarsVersionsSince?: string;
    commandsPath: string;
    entitiesPath: string;
    datamapsPath: string;
    protobufsPath: string;
    gameEventsPaths: { file: string; path: string }[];
};

export const GAMES: Game[] = [
    {
        id: "cs2",
        name: "Counter-Strike 2",
        icon: "https://shared.fastly.steamstatic.com/community_assets/images/apps/730/8dbc71957312bbd3baea65848b545be9eae2a355.jpg",
        repoOwner: "Swiftly-Tracker",
        repoName: "CS2-Dumps",
        dumpPath: "dump/sdk.json",
        convarsPath: "dump/convars.json",
        convarsVersionsSince: "4a18dfa0e582bd997f2976fb979d1cfeb61956d4",
        commandsPath: "dump/commands.json",
        entitiesPath: "dump/entities.json",
        datamapsPath: "dump/datamaps.json",
        protobufsPath: "protobufs",
        gameEventsPaths: [
            {
                file: "core.gameevents",
                path: "install/game/core/pak01/resource/core.gameevents",
            },
            {
                file: "game.gameevents",
                path: "install/game/csgo/pak01/resource/game.gameevents",
            },
            {
                file: "mod.gameevents",
                path: "install/game/csgo/pak01/resource/mod.gameevents",
            },
        ],
    },
];

export const DEFAULT_GAME_ID = GAMES[0].id;

export function getGame(id: string): Game | undefined {
    return GAMES.find((game) => game.id === id);
}

export function getFileUrl(game: Game, path: string, ref = "main"): string {
    return `https://raw.githubusercontent.com/${game.repoOwner}/${game.repoName}/${ref}/${path}`;
}

export function getDumpUrl(game: Game, ref = "main"): string {
    return getFileUrl(game, game.dumpPath, ref);
}
