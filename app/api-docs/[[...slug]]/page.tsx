import { notFound, redirect } from "next/navigation";
import { getApiDump } from "@/lib/api-docs/dump";
import {
    apiDocsHref,
    buildFlatSequence,
    buildNavTree,
    buildUidIndex,
    findType,
    parseBranchSlug,
} from "@/lib/api-docs/tree";
import { ApiDocsOverview } from "@/components/api-docs/overview";
import { TypePage } from "@/components/api-docs/type-page";
import { PrevNext } from "@/components/api-docs/prev-next";

export default async function ApiDocsPage({
    params,
}: {
    params: Promise<{ slug?: string[] }>;
}) {
    const { slug = [] } = await params;
    const { branch, rest, legacy } = parseBranchSlug(slug);

    if (legacy) {
        redirect(apiDocsHref(branch, ...rest));
    }

    let dump;
    try {
        dump = await getApiDump(branch);
    } catch {
        return (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
                API docs are temporarily unavailable - try again shortly.
            </div>
        );
    }

    if (rest.length === 0) {
        return <ApiDocsOverview branch={branch} categories={buildNavTree(dump)} />;
    }

    if (rest.length !== 2) {
        notFound();
    }

    const [categorySlug, typeSlug] = rest;
    const found = findType(dump, categorySlug, typeSlug);
    if (!found) {
        notFound();
    }

    const uidIndex = buildUidIndex(dump);
    const flat = buildFlatSequence(dump);

    return (
        <>
            <TypePage category={found.category} type={found.type} branch={branch} uidIndex={uidIndex} />
            <PrevNext branch={branch} flat={flat} categorySlug={categorySlug} typeSlug={typeSlug} />
        </>
    );
}
