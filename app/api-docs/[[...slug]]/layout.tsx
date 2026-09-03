import type { ReactNode } from "react";
import { getApiDump } from "@/lib/api-docs/dump";
import { buildNavTree, parseBranchSlug } from "@/lib/api-docs/tree";
import { ApiDocsSidebar } from "@/components/api-docs/api-docs-sidebar";
import { GridBackdrop } from "@/components/grid-backdrop";

export default async function ApiDocsLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ slug?: string[] }>;
}) {
    const { slug } = await params;
    const { branch } = parseBranchSlug(slug);

    let categories: ReturnType<typeof buildNavTree> = [];
    try {
        const dump = await getApiDump(branch);
        categories = buildNavTree(dump);
    } catch {
        categories = [];
    }

    return (
        <div className="relative flex-1 px-6 pb-16 pt-12">
            <GridBackdrop />
            <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[340px_1fr]">
                <ApiDocsSidebar categories={categories} branch={branch} />
                <div className="min-w-0">{children}</div>
            </div>
        </div>
    );
}
