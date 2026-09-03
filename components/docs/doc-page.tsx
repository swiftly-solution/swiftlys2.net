import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode, {
    type Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import { getDocPageSource, getDocsMeta } from "@/lib/docs/dump";
import { findDocPage } from "@/lib/docs/tree";
import { extractOutline } from "@/lib/docs/outline";
import { mdxComponents } from "@/components/docs/mdx-components";
import { Toc } from "@/components/docs/toc";

type Frontmatter = { title?: string };

const prettyCodeOptions: PrettyCodeOptions = {
    theme: "github-dark-default",
    keepBackground: false,
};

export async function DocPage({ slugParts }: { slugParts: string[] }) {
    let meta;
    try {
        meta = await getDocsMeta();
    } catch {
        return (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
                Docs are temporarily unavailable - try again shortly.
            </div>
        );
    }

    const ref = findDocPage(meta, slugParts);
    if (!ref) {
        notFound();
    }

    let source: string;
    try {
        source = await getDocPageSource(ref.page);
    } catch {
        return (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-6 text-center text-sm text-zinc-500">
                Docs are temporarily unavailable - try again shortly.
            </div>
        );
    }

    const { content, frontmatter } = await compileMDX<Frontmatter>({
        source,
        options: {
            parseFrontmatter: true,
            mdxOptions: {
                rehypePlugins: [
                    rehypeSlug,
                    [rehypePrettyCode, prettyCodeOptions],
                ],
            },
        },
        components: mdxComponents,
    });

    const outline = extractOutline(source);

    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,48rem)_1fr_280px]">
            <article className="min-w-0 xl:col-start-1">
                {frontmatter.title && (
                    <h1 className="font-mono text-3xl font-bold text-white">
                        {frontmatter.title}
                    </h1>
                )}
                <div className="mt-4">{content}</div>
            </article>
            <div className="xl:col-start-3">
                <Toc items={outline} />
            </div>
        </div>
    );
}
