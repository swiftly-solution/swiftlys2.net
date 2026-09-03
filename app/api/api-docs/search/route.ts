import { NextResponse, type NextRequest } from "next/server";
import { getApiDump } from "@/lib/api-docs/dump";
import { isApiBranch, slugify } from "@/lib/api-docs/tree";
import { stripMarkup } from "@/lib/api-docs/xref";

const MAX_RESULTS = 20;
const SNIPPET_LENGTH = 160;

export type ApiDocsSearchResult = {
    categorySlug: string;
    typeSlug: string;
    typeName: string;
    memberName: string | null;
    snippet: string;
    anchor: string | null;
};

function snippet(text: string): string {
    return text.length > SNIPPET_LENGTH ? `${text.slice(0, SNIPPET_LENGTH)}…` : text;
}

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
    if (!q) {
        return NextResponse.json([]);
    }

    const branchParam = request.nextUrl.searchParams.get("branch") ?? undefined;
    const branch = isApiBranch(branchParam) ? branchParam : "stable";

    let dump;
    try {
        dump = await getApiDump(branch);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const results: ApiDocsSearchResult[] = [];

    outer: for (const category of dump.categories) {
        const categorySlug = slugify(category.category);

        for (const type of category.types) {
            if (results.length >= MAX_RESULTS) break outer;
            const typeSlug = slugify(type.name);

            if (type.name.toLowerCase().includes(q) || category.category.toLowerCase().includes(q)) {
                results.push({
                    categorySlug,
                    typeSlug,
                    typeName: type.name,
                    memberName: null,
                    snippet: type.summary ? snippet(stripMarkup(type.summary)) : type.name,
                    anchor: null,
                });
                continue;
            }

            if (type.summary && stripMarkup(type.summary).toLowerCase().includes(q)) {
                results.push({
                    categorySlug,
                    typeSlug,
                    typeName: type.name,
                    memberName: null,
                    snippet: snippet(stripMarkup(type.summary)),
                    anchor: null,
                });
                continue;
            }

            const memberGroups = [
                type.constructors,
                type.properties,
                type.methods,
                type.fields,
                type.operators,
            ];

            for (const members of memberGroups) {
                if (!members) continue;
                for (const member of members) {
                    if (results.length >= MAX_RESULTS) break outer;
                    const matchesName = member.name.toLowerCase().includes(q);
                    const matchesSummary = member.summary
                        ? stripMarkup(member.summary).toLowerCase().includes(q)
                        : false;
                    if (!matchesName && !matchesSummary) continue;

                    results.push({
                        categorySlug,
                        typeSlug,
                        typeName: type.name,
                        memberName: member.name,
                        snippet: member.summary ? snippet(stripMarkup(member.summary)) : member.name,
                        anchor: slugify(member.uid),
                    });
                }
            }
        }
    }

    return NextResponse.json(results);
}
