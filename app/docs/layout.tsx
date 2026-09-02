import type { ReactNode } from "react";
import { getDocPageSource, getDocsMeta } from "@/lib/docs/dump";
import { extractFrontmatterTitle } from "@/lib/docs/frontmatter";
import { DocsSidebar, type DocsNavItem } from "@/components/docs/docs-sidebar";
import type { DocsMeta } from "@/lib/docs/types";

async function buildNavTree(
    meta: DocsMeta,
    prefix = "",
): Promise<DocsNavItem[]> {
    return Promise.all(
        Object.entries(meta).map(async ([key, entry]) => {
            const slug = prefix ? `${prefix}/${key}` : key;
            let title = entry.title ?? key;

            if (entry.page) {
                try {
                    const source = await getDocPageSource(entry.page);
                    title = extractFrontmatterTitle(source) ?? title;
                } catch {}
            }

            const children = entry.children
                ? await buildNavTree(entry.children, slug)
                : undefined;

            return { slug, title, children };
        }),
    );
}

export default async function DocsLayout({
    children,
}: {
    children: ReactNode;
}) {
    let navItems: DocsNavItem[] = [];
    try {
        const meta = await getDocsMeta();
        navItems = await buildNavTree(meta);
    } catch {
        navItems = [];
    }

    return (
        <div className="relative flex-1 px-6 pb-16 pt-12">
            <div className="mx-auto grid max-w-[1350px] gap-8 lg:grid-cols-[260px_1fr]">
                <DocsSidebar items={navItems} />
                <div className="min-w-0">{children}</div>
            </div>
        </div>
    );
}
