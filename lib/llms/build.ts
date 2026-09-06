import { REPO_URL } from "@/lib/github";
import { getDocPageSource } from "@/lib/docs/dump";
import { docHref, listDocPages } from "@/lib/docs/pages";

const DISCORD_URL = "https://swiftlys2.net/discord";

const MCP_TOOLS = [
    "schema_lookup", "schema_list", "schema_search",
    "entity_lookup", "entity_list", "entity_search",
    "protobuf_lookup", "protobuf_list", "protobuf_search",
    "gameevent_lookup", "gameevent_list", "gameevent_search",
    "convar_lookup", "convar_list", "convar_search",
    "apidocs_lookup", "apidocs_list", "apidocs_search",
    "docs_list", "docs_search",
    "site_search",
];

export async function buildLlmsTxt(baseUrl: string): Promise<string> {
    const lines: string[] = [];
    lines.push("# SwiftlyS2");
    lines.push("");
    lines.push(
        "> SwiftlyS2 is a C# plugin framework for Counter-Strike 2 (Source 2). This file points AI agents and LLMs at the site's docs, API reference, data viewers, and its MCP server for live lookups.",
    );
    lines.push("");

    lines.push("## Docs");
    try {
        for (const { slug, title } of await listDocPages()) {
            lines.push(`- [${title}](${baseUrl}${docHref(slug)})`);
        }
    } catch {
        lines.push(`- [Docs](${baseUrl}/docs)`);
    }
    lines.push("");

    lines.push("## API reference");
    lines.push(`- [C# API docs](${baseUrl}/api-docs/stable)`);
    lines.push("");

    lines.push("## Data viewers");
    lines.push(`- [Schema viewer](${baseUrl}/schema-viewer)`);
    lines.push(`- [Entity viewer](${baseUrl}/entity-viewer)`);
    lines.push(`- [Protobuf viewer](${baseUrl}/protobuf-viewer)`);
    lines.push(`- [Game events viewer](${baseUrl}/gameevents-viewer)`);
    lines.push(`- [ConVars & ConCommands viewer](${baseUrl}/convars-viewer)`);
    lines.push("");

    lines.push("## AI tools");
    lines.push(
        `- [AI tools overview](${baseUrl}/ai) - how to connect an MCP client`,
    );
    lines.push(
        `- MCP server endpoint: \`${baseUrl}/api/mcp\` (Streamable HTTP) - tools: ${MCP_TOOLS.join(", ")}`,
    );
    lines.push(`- [Full docs dump](${baseUrl}/llms-full.txt)`);
    lines.push("");

    lines.push("## Project");
    lines.push(`- [GitHub](${REPO_URL})`);
    lines.push(`- [Discord](${DISCORD_URL})`);

    return `${lines.join("\n")}\n`;
}

export async function buildLlmsFullTxt(baseUrl: string): Promise<string> {
    const header = await buildLlmsTxt(baseUrl);
    const sections: string[] = [header, "\n---\n"];

    try {
        for (const { slug, page } of await listDocPages()) {
            try {
                const source = await getDocPageSource(page);
                sections.push(`\n## ${baseUrl}${docHref(slug)}\n\n${source}\n`);
            } catch { }
        }
    } catch { }

    return sections.join("\n");
}
