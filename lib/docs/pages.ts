import { getDocPageSource, getDocsMeta } from "@/lib/docs/dump";
import { extractFrontmatterTitle } from "@/lib/docs/frontmatter";
import { flattenDocsMeta } from "@/lib/docs/tree";

export type DocPageInfo = { slug: string; page: string; title: string };

export function docHref(slug: string): string {
    return slug === "_index" ? "/docs" : `/docs/${slug}`;
}

export async function listDocPages(): Promise<DocPageInfo[]> {
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
