import { NextResponse, type NextRequest } from "next/server";
import GithubSlugger from "github-slugger";
import { getDocPageSource, getDocsMeta } from "@/lib/docs/dump";
import { flattenDocsMeta } from "@/lib/docs/tree";
import { extractFrontmatterTitle } from "@/lib/docs/frontmatter";

const MAX_RESULTS = 20;
const SNIPPET_LENGTH = 160;

export type DocsSearchResult = {
    slug: string;
    title: string;
    heading: string | null;
    anchor: string | null;
    snippet: string;
};

function cleanText(text: string): string {
    return text
        .replace(/<[^>]+>/g, " ")
        .replace(/`+/g, "")
        .replace(/[*_#>]/g, " ")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
    if (!q) {
        return NextResponse.json([]);
    }

    let meta;
    try {
        meta = await getDocsMeta();
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const pages = flattenDocsMeta(meta);
    const results: DocsSearchResult[] = [];

    for (const page of pages) {
        if (results.length >= MAX_RESULTS) break;

        let source: string;
        try {
            source = await getDocPageSource(page.page);
        } catch {
            continue;
        }

        const title = extractFrontmatterTitle(source) ?? page.slug;
        const slugger = new GithubSlugger();
        let currentHeading: { id: string; text: string } | null = null;
        let inCodeBlock = false;
        let inFrontmatter = false;

        for (const rawLine of source.split("\n")) {
            const line = rawLine.trim();

            if (line === "---") {
                inFrontmatter = !inFrontmatter;
                continue;
            }
            if (inFrontmatter) continue;

            if (line.startsWith("```")) {
                inCodeBlock = !inCodeBlock;
                continue;
            }
            if (inCodeBlock || !line) continue;

            const h2Match = line.match(/^##\s+(.+)$/);
            const h1Match = h2Match ? null : line.match(/^#\s+(.+)$/);
            const headingMatch = h2Match ?? h1Match;
            if (headingMatch) {
                const text = headingMatch[1].trim();
                currentHeading = { id: slugger.slug(text), text };

                if (text.toLowerCase().includes(q)) {
                    results.push({
                        slug: page.slug,
                        title,
                        heading: text,
                        anchor: currentHeading.id,
                        snippet: text,
                    });
                    if (results.length >= MAX_RESULTS) break;
                }
                continue;
            }

            const cleaned = cleanText(line);
            if (!cleaned || !cleaned.toLowerCase().includes(q)) continue;

            results.push({
                slug: page.slug,
                title,
                heading: currentHeading?.text ?? null,
                anchor: currentHeading?.id ?? null,
                snippet:
                    cleaned.length > SNIPPET_LENGTH
                        ? `${cleaned.slice(0, SNIPPET_LENGTH)}…`
                        : cleaned,
            });
            if (results.length >= MAX_RESULTS) break;
        }
    }

    return NextResponse.json(results);
}
