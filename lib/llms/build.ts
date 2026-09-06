import { REPO_URL } from "@/lib/github";
import { getDocPageSource, getDocsMeta } from "@/lib/docs/dump";
import { extractFrontmatterTitle } from "@/lib/docs/frontmatter";
import { flattenDocsMeta } from "@/lib/docs/tree";

const DISCORD_URL = "https://swiftlys2.net/discord";

function docHref(baseUrl: string, slug: string): string {
    return slug === "_index" ? `${baseUrl}/docs` : `${baseUrl}/docs/${slug}`;
}

async function listDocPages(
    baseUrl: string,
): Promise<{ slug: string; page: string; title: string }[]> {
    const meta = await getDocsMeta();
    return Promise.all(
        flattenDocsMeta(meta).map(async ({ slug, page }) => {
            let title = slug;
            try {
                const source = await getDocPageSource(page);
                title = extractFrontmatterTitle(source) ?? slug;
            } catch {}
            return { slug, page, title };
        }),
    );
}

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
        for (const { slug, title } of await listDocPages(baseUrl)) {
            lines.push(`- [${title}](${docHref(baseUrl, slug)})`);
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
        `- MCP server endpoint: \`${baseUrl}/api/mcp\` (Streamable HTTP) - tools: schema_lookup, entity_lookup, protobuf_lookup, gameevent_lookup, convar_lookup, apidocs_lookup`,
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
        const meta = await getDocsMeta();
        for (const { slug, page } of flattenDocsMeta(meta)) {
            try {
                const source = await getDocPageSource(page);
                sections.push(`\n## ${docHref(baseUrl, slug)}\n\n${source}\n`);
            } catch { }
        }
    } catch { }

    return sections.join("\n");
}
