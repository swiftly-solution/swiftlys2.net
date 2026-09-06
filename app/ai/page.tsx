import { Bot, FileText, Wrench } from "lucide-react";
import { getBaseUrl } from "@/lib/base-url";
import { CopyBlock } from "@/components/ai/copy-block";

const CARD_CLASS = "rounded-2xl border border-white/10 bg-zinc-950/40 p-6";

const DOMAINS = [
    {
        domain: "Schema",
        tools: [
            { name: "schema_lookup", desc: "Exact class/enum by name -> fields + link." },
            { name: "schema_list", desc: "Browse projects, or list a project's classes/enums." },
            { name: "schema_search", desc: "Search fields by name, type, offset, networked." },
        ],
    },
    {
        domain: "Entities",
        tools: [
            { name: "entity_lookup", desc: "Exact entity class by name -> datamap + link." },
            { name: "entity_list", desc: "List entity class names, optionally by prefix." },
            { name: "entity_search", desc: "Search classes and input/output/member fields." },
        ],
    },
    {
        domain: "Protobuf",
        tools: [
            { name: "protobuf_lookup", desc: "Exact message/enum by name -> fields + link." },
            { name: "protobuf_list", desc: "Browse modules/files, or list one's contents." },
            { name: "protobuf_search", desc: "Search by name, net message id, kind, file." },
        ],
    },
    {
        domain: "Game events",
        tools: [
            { name: "gameevent_lookup", desc: "Exact event by name -> fields + link." },
            { name: "gameevent_list", desc: "Browse gameevents files, or list one's events." },
            { name: "gameevent_search", desc: "Search by name, field name, or hex hash." },
        ],
    },
    {
        domain: "ConVars",
        tools: [
            { name: "convar_lookup", desc: "Exact convar/concommand by name -> flags + link." },
            { name: "convar_list", desc: "Browse modules, or list one's entries." },
            {
                name: "convar_search",
                desc: "Full tag search: kind + include/exclude module, flag, attribute.",
            },
        ],
    },
    {
        domain: "API docs",
        tools: [
            { name: "apidocs_lookup", desc: "Exact type (or member) by name -> declaration + link." },
            { name: "apidocs_list", desc: "Browse categories, or list one's types." },
            { name: "apidocs_search", desc: "Search type/member names and summaries." },
        ],
    },
    {
        domain: "Docs",
        tools: [
            { name: "docs_list", desc: "List every docs page with its title and URL." },
            { name: "docs_search", desc: "Search page bodies and headings for a snippet." },
        ],
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
                <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                    Every domain gets the same three shapes: <code className="text-accent">*_lookup</code>{" "}
                    for an exact name, <code className="text-accent">*_list</code> to browse without
                    knowing a name yet, and <code className="text-accent">*_search</code> - the same
                    engine behind that domain&apos;s search bar, filters and all.
                </p>

                <div className={`${CARD_CLASS} mt-4 border-accent/30 bg-accent/5`}>
                    <div className="flex items-center justify-between gap-3">
                        <code className="font-mono text-sm text-accent">site_search</code>
                        <span className="rounded-full border border-accent/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent">
                            searches everything
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">
                        One call across schema, entities, protobuf, game events,
                        convars, and docs at once - exactly like the{" "}
                        <span className="text-accent">site:</span> prefix in the
                        site&apos;s own search bar. Start here when you don&apos;t
                        know which domain to reach for.
                    </p>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {DOMAINS.map((group) => (
                        <div key={group.domain} className={CARD_CLASS}>
                            <div className="font-mono text-sm font-semibold text-white">
                                {group.domain}
                            </div>
                            <div className="mt-3 space-y-2.5">
                                {group.tools.map((tool) => (
                                    <div key={tool.name}>
                                        <code className="font-mono text-xs text-accent">
                                            {tool.name}
                                        </code>
                                        <p className="text-xs text-zinc-400">{tool.desc}</p>
                                    </div>
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
