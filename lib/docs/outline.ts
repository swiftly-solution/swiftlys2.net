import GithubSlugger from "github-slugger";

export type OutlineItem = { id: string; text: string; depth: 1 | 2 };

export function extractOutline(source: string): OutlineItem[] {
    const slugger = new GithubSlugger();
    const items: OutlineItem[] = [];
    let inCodeBlock = false;

    for (const line of source.split("\n")) {
        if (line.trim().startsWith("```")) {
            inCodeBlock = !inCodeBlock;
            continue;
        }
        if (inCodeBlock) continue;

        const h2Match = line.match(/^##\s+(.+)$/);
        const h1Match = line.match(/^#\s+(.+)$/);

        if (h2Match) {
            const text = h2Match[1].trim();
            items.push({ id: slugger.slug(text), text, depth: 2 });
        } else if (h1Match) {
            const text = h1Match[1].trim();
            items.push({ id: slugger.slug(text), text, depth: 1 });
        }
    }

    return items;
}
