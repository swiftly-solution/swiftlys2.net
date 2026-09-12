import { Bot, FileText, Wrench } from "lucide-react";
import { getBaseUrl } from "@/lib/base-url";
import { CopyBlock } from "@/components/ai/copy-block";
import { TOOL_GROUPS } from "@/lib/mcp/tools";
import { describeToolInput, type ToolDef } from "@/lib/mcp/tools/types";

const CARD_CLASS = "rounded-2xl border border-white/10 bg-zinc-950/40 p-6";

function ToolCard({ tool }: { tool: ToolDef }) {
    const params = describeToolInput(tool.inputSchema);

    return (
        <div>
            <code className="font-mono text-xs text-accent">{tool.name}</code>
            <p className="text-xs text-zinc-400">{tool.description}</p>

            {params.length > 0 && (
                <div className="mt-1.5 space-y-1 border-l border-white/10 pl-3">
                    {params.map((p) => (
                        <div
                            key={p.name}
                            className="flex flex-wrap items-baseline gap-x-1.5 font-mono text-[11px]"
                        >
                            <span className="text-zinc-300">{p.name}</span>
                            <span className="text-zinc-600">
                                {p.enumValues
                                    ? `enum(${p.enumValues.join("|")})`
                                    : p.type}
                            </span>
                            {!p.required && (
                                <span className="text-zinc-600">optional</span>
                            )}
                            {p.default !== undefined && (
                                <span className="text-zinc-600">
                                    default: {JSON.stringify(p.default)}
                                </span>
                            )}
                            {p.description && (
                                <span className="basis-full text-zinc-500">
                                    {p.description}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

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

    const siteSearchTool = TOOL_GROUPS.find((g) => g.domain === "Site")
        ?.tools[0];
    const domainGroups = TOOL_GROUPS.filter((g) => g.domain !== "Site");

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
                Panorama, and API docs data to AI agents - so your coding assistant
                can look up the exact field, flag, or method it needs instead of
                guessing.
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
                <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                    Every domain gets the same three shapes: <code className="text-accent">*_lookup</code>{" "}
                    for an exact name, <code className="text-accent">*_list</code> to browse without
                    knowing a name yet, and <code className="text-accent">*_search</code> - the same
                    engine behind that domain&apos;s search bar, filters and all. Each
                    tool below is generated straight from its MCP registration, so
                    the parameters shown always match what the server accepts.
                </p>

                {siteSearchTool && (
                    <div className={`${CARD_CLASS} mt-4 border-accent/30 bg-accent/5`}>
                        <div className="flex items-center justify-between gap-3">
                            <code className="font-mono text-sm text-accent">
                                {siteSearchTool.name}
                            </code>
                            <span className="rounded-full border border-accent/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent">
                                searches everything
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-400">
                            {siteSearchTool.description}
                        </p>
                        <div className="mt-3">
                            <ToolCard tool={siteSearchTool} />
                        </div>
                    </div>
                )}

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {domainGroups.map((group) => (
                        <div key={group.domain} className={CARD_CLASS}>
                            <div className="font-mono text-sm font-semibold text-white">
                                {group.domain}
                            </div>
                            <div className="mt-3 space-y-3">
                                {group.tools.map((tool) => (
                                    <ToolCard key={tool.name} tool={tool} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-sm text-zinc-500">
                    Lookups auto-resolve what they can (schema project, protobuf
                    file, convar module) from just a name. List/search results
                    are capped and report a total + truncated flag rather than
                    ever dumping an entire dump into context.
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
