import type { ApiBranch, ApiCategory, ApiType } from "@/lib/api-docs/types";
import { slugify, type UidIndexEntry } from "@/lib/api-docs/tree";
import { API_ASSEMBLY_NAME } from "@/lib/api-docs/config";
import { TypeBadge } from "@/components/api-docs/type-badge";
import { TypeRef } from "@/components/api-docs/type-ref";
import { InlineText } from "@/components/api-docs/inline-markup";
import { MemberSection } from "@/components/api-docs/member-section";
import { HighlightedCode } from "@/components/api-docs/highlighted-code";
import { Toc } from "@/components/docs/toc";
import type { OutlineItem } from "@/lib/docs/outline";

export function TypePage({
    category,
    type,
    branch,
    uidIndex,
}: {
    category: ApiCategory;
    type: ApiType;
    branch: ApiBranch;
    uidIndex: Map<string, UidIndexEntry>;
}) {
    const sections: { title: string; members: ApiType["constructors"] }[] = [
        { title: "Constructors", members: type.constructors },
        { title: "Properties", members: type.properties },
        { title: "Methods", members: type.methods },
        { title: "Fields", members: type.fields },
        { title: "Operators", members: type.operators },
    ];

    const outline: OutlineItem[] = [];
    for (const { title, members } of sections) {
        if (!members || members.length === 0) continue;
        outline.push({ id: slugify(title), text: title, depth: 1 });
        for (const member of members) {
            outline.push({ id: slugify(member.uid), text: member.name, depth: 2 });
        }
    }

    const hasInherits = (type.inherits?.length ?? 0) > 0;
    const hasImplements = (type.implements?.length ?? 0) > 0;

    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,48rem)_1fr_280px]">
            <article className="min-w-0 xl:col-start-1">
                <div className="font-mono text-xs text-zinc-500">
                    API Reference <span className="text-zinc-700">&rsaquo;</span> {category.category}
                </div>
                <div className="mt-2 flex items-center gap-3">
                    <h1 className="font-mono text-3xl font-bold text-white">{type.name}</h1>
                    <TypeBadge kind={type.type} />
                </div>
                <div className="mt-2 font-mono text-xs text-zinc-500">
                    Namespace: {category.namespace} &middot; Assembly: {API_ASSEMBLY_NAME}
                </div>
                <HighlightedCode code={type.declaration} className="mt-4" />
                {(hasInherits || hasImplements) && (
                    <div className="mt-3 space-y-1 font-mono text-sm">
                        {hasInherits && (
                            <div>
                                <span className="text-xs uppercase tracking-wide text-zinc-500">Inherits </span>
                                {type.inherits!.map((token, i) => (
                                    <span key={i}>
                                        {i > 0 && <span className="text-zinc-600">, </span>}
                                        <TypeRef tokens={[token]} branch={branch} uidIndex={uidIndex} />
                                    </span>
                                ))}
                            </div>
                        )}
                        {hasImplements && (
                            <div>
                                <span className="text-xs uppercase tracking-wide text-zinc-500">Implements </span>
                                {type.implements!.map((token, i) => (
                                    <span key={i}>
                                        {i > 0 && <span className="text-zinc-600">, </span>}
                                        <TypeRef tokens={[token]} branch={branch} uidIndex={uidIndex} />
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {type.summary && (
                    <p className="mt-4 leading-relaxed text-zinc-400">
                        <InlineText text={type.summary} branch={branch} uidIndex={uidIndex} />
                    </p>
                )}
                {type.remarks && (
                    <p className="mt-3 leading-relaxed text-zinc-500">
                        <InlineText text={type.remarks} branch={branch} uidIndex={uidIndex} />
                    </p>
                )}
                {type.sourceUrl && (
                    <a
                        href={type.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-block text-sm text-accent hover:underline"
                    >
                        View source
                    </a>
                )}
                {sections.map(({ title, members }) => (
                    <MemberSection key={title} title={title} members={members} branch={branch} uidIndex={uidIndex} />
                ))}
            </article>
            <div className="xl:col-start-3">
                <Toc items={outline} />
            </div>
        </div>
    );
}
