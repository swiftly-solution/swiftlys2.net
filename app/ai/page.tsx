import { Bot, FileText, Wrench } from "lucide-react";
import { getBaseUrl } from "@/lib/base-url";
import { CopyBlock } from "@/components/ai/copy-block";

const CARD_CLASS = "rounded-2xl border border-white/10 bg-zinc-950/40 p-6";

const TOOLS = [
    {
        name: "schema_lookup",
        summary:
            "Resolve a Source 2 schema class or enum by name and return its fields plus a schema-viewer link.",
        example: '{ "name": "CBaseEntity" }',
    },
    {
        name: "entity_lookup",
        summary:
            "Resolve an entity class by name and return its datamap (inputs/outputs/members) plus an entity-viewer link.",
        example: '{ "className": "CCSPlayerPawn" }',
    },
    {
        name: "protobuf_lookup",
        summary:
            "Resolve a protobuf message or enum by name and return its fields/values plus a protobuf-viewer link.",
        example: '{ "name": "CMsgSayText2" }',
    },
    {
        name: "gameevent_lookup",
        summary:
            "Resolve a game event by name and return its fields plus a game-events-viewer link.",
        example: '{ "name": "player_death" }',
    },
    {
        name: "convar_lookup",
        summary:
            "Resolve a convar or concommand by name and return its flags/description plus a convars-viewer link.",
        example: '{ "name": "sv_cheats" }',
    },
    {
        name: "apidocs_lookup",
        summary:
            "Resolve a SwiftlyS2 C# API type (optionally a specific member) and return its declaration plus an API docs link.",
        example: '{ "name": "IPlayerManagerService", "member": "SendCenterHTML" }',
    },
];

export default async function AiPage() {
    const baseUrl = await getBaseUrl();
    const mcpUrl = `${baseUrl}/api/mcp`;

    const configSnippet = JSON.stringify(
        {
            mcpServers: {
                swiftlys2: {
                    url: mcpUrl,
                },
            },
        },
        null,
        4,
    );

    return (
        <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-accent">
                <Bot className="h-4 w-4" />
                AI Tools
            </div>
            <h1 className="mt-3 font-mono text-3xl font-bold text-white">
                Give your AI live access to SwiftlyS2 data
            </h1>
            <p className="mt-4 max-w-2xl text-zinc-400">
                SwiftlyS2 exposes its schema, entity, protobuf, game event, convar,
                and API docs data to AI agents - so your coding assistant can look
                up the exact field, flag, or method it needs instead of guessing.
            </p>

            <section className="mt-10">
                <h2 className="font-mono text-xl font-bold text-white">
                    Connect an MCP client
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                    SwiftlyS2 runs a{" "}
                    <a
                        href="https://modelcontextprotocol.io"
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline"
                    >
                        Model Context Protocol
                    </a>{" "}
                    server over Streamable HTTP. Add it to Claude Code, Claude
                    Desktop, Cursor, or any other MCP-compatible client.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <CopyBlock label="Endpoint" text={mcpUrl} />
                    <CopyBlock label="mcpServers config" text={configSnippet} />
                </div>
            </section>

            <section className="mt-10">
                <h2 className="flex items-center gap-2 font-mono text-xl font-bold text-white">
                    <Wrench className="h-5 w-5 text-accent" />
                    Available tools
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {TOOLS.map((tool) => (
                        <div key={tool.name} className={CARD_CLASS}>
                            <code className="font-mono text-sm text-accent">
                                {tool.name}
                            </code>
                            <p className="mt-2 text-sm text-zinc-400">
                                {tool.summary}
                            </p>
                            <pre className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-zinc-300">
                                {tool.example}
                            </pre>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-sm text-zinc-500">
                    Every tool auto-resolves what it can (schema project,
                    protobuf file, convar module) from just a name, and returns
                    a direct link to the matching page alongside the data.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="flex items-center gap-2 font-mono text-xl font-bold text-white">
                    <FileText className="h-5 w-5 text-accent" />
                    llms.txt
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                    A plain-text index of the docs and API surface, following the{" "}
                    <a
                        href="https://llmstxt.org"
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline"
                    >
                        llms.txt
                    </a>{" "}
                    convention - for agents that ingest context directly instead
                    of calling tools.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className={CARD_CLASS}>
                        <a
                            href="/llms.txt"
                            className="font-mono text-sm text-accent hover:underline"
                        >
                            /llms.txt
                        </a>
                        <p className="mt-2 text-sm text-zinc-400">
                            Short index: links to every doc page, the API
                            reference, the data viewers, and this MCP server.
                        </p>
                    </div>
                    <div className={CARD_CLASS}>
                        <a
                            href="/llms-full.txt"
                            className="font-mono text-sm text-accent hover:underline"
                        >
                            /llms-full.txt
                        </a>
                        <p className="mt-2 text-sm text-zinc-400">
                            The full index plus the raw markdown of every doc
                            page inlined, for one-shot ingestion.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mt-10">
                <h2 className="font-mono text-xl font-bold text-white">
                    Structured references in docs
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                    Docs pages can link straight into the viewers with a name -
                    no need to know the project, module, or file it lives in.
                    These render as verified links (or a visible warning if the
                    name doesn&apos;t exist), which also makes the docs
                    themselves easier for an LLM to ground against real data.
                </p>
                <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-zinc-950 p-4 font-mono text-sm text-zinc-300">
                    {`<SchemaRef name="CBaseEntity" />
<EntityRef name="CCSPlayerPawn" />
<ProtobufRef name="CMsgSayText2" />
<GameEventRef name="player_death" />
<ConvarRef name="sv_cheats" />
<ApiRef name="IPlayerManagerService" member="SendCenterHTML" />`}
                </pre>
            </section>
        </div>
    );
}
