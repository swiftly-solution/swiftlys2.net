import type { ApiBranch, ApiMember } from "@/lib/api-docs/types";
import { slugify, type UidIndexEntry } from "@/lib/api-docs/tree";
import { TypeRef } from "@/components/api-docs/type-ref";
import { InlineText } from "@/components/api-docs/inline-markup";
import { GithubIcon } from "@/components/github-icon";
import { HighlightedCode } from "@/components/api-docs/highlighted-code";

export function MemberCard({
    member,
    branch,
    uidIndex,
    valueLabel = "Value",
}: {
    member: ApiMember;
    branch: ApiBranch;
    uidIndex: Map<string, UidIndexEntry>;
    valueLabel?: string;
}) {
    const hasParameters = (member.parameters?.length ?? 0) > 0;
    const hasExceptions = (member.exceptions?.length ?? 0) > 0;

    return (
        <div
            id={slugify(member.uid)}
            className="scroll-mt-24 border-t border-white/5 py-6 first:border-t-0 first:pt-0"
        >
            <div className="flex items-start justify-between gap-3">
                <h4 className="font-mono text-base font-semibold text-white">{member.name}</h4>
                {member.sourceUrl && (
                    <a
                        href={member.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="View source"
                        className="shrink-0 text-zinc-600 transition-colors hover:text-accent"
                    >
                        <GithubIcon className="h-4 w-4" />
                    </a>
                )}
            </div>
            {member.summary && (
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    <InlineText text={member.summary} branch={branch} uidIndex={uidIndex} />
                </p>
            )}
            <HighlightedCode code={member.declaration} className="mt-3" />
            {hasParameters && (
                <div className="mt-3 space-y-1.5">
                    <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                        Parameters
                    </div>
                    <ul className="space-y-1.5 text-sm">
                        {member.parameters!.map((param) => (
                            <li key={param.name} className="flex flex-wrap items-baseline gap-x-2">
                                <span className="font-mono text-zinc-300">{param.name}</span>
                                {param.type && (
                                    <span className="font-mono text-code-type [&_a]:text-code-type [&_a:hover]:underline">
                                        <TypeRef tokens={param.type} branch={branch} uidIndex={uidIndex} />
                                    </span>
                                )}
                                {param.optional && (
                                    <span className="text-[10px] uppercase text-zinc-600">optional</span>
                                )}
                                {param.description && (
                                    <span className="w-full text-xs text-zinc-500">
                                        <InlineText text={param.description} branch={branch} uidIndex={uidIndex} />
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {member.returns?.type && (
                <div className="mt-3 space-y-1">
                    <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                        Returns
                    </div>
                    <div className="font-mono text-sm text-code-type [&_a]:text-code-type [&_a:hover]:underline">
                        <TypeRef tokens={member.returns.type} branch={branch} uidIndex={uidIndex} />
                    </div>
                    {member.returns.description && (
                        <div className="text-xs text-zinc-500">
                            <InlineText text={member.returns.description} branch={branch} uidIndex={uidIndex} />
                        </div>
                    )}
                </div>
            )}
            {member.valueType && (
                <div className="mt-3 space-y-1">
                    <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                        {valueLabel}
                    </div>
                    <div className="font-mono text-sm text-code-type [&_a]:text-code-type [&_a:hover]:underline">
                        <TypeRef tokens={member.valueType} branch={branch} uidIndex={uidIndex} />
                    </div>
                </div>
            )}
            {hasExceptions && (
                <div className="mt-3 space-y-1">
                    <div className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                        Exceptions
                    </div>
                    <ul className="space-y-1 text-sm text-zinc-400">
                        {member.exceptions!.map((exception, i) => (
                            <li key={i} className="font-mono">
                                {exception.type && (
                                    <TypeRef tokens={exception.type} branch={branch} uidIndex={uidIndex} />
                                )}
                                {exception.description && (
                                    <span className="ml-2 text-xs text-zinc-500">
                                        <InlineText text={exception.description} branch={branch} uidIndex={uidIndex} />
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {member.remarks && (
                <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                    <InlineText text={member.remarks} branch={branch} uidIndex={uidIndex} />
                </p>
            )}
        </div>
    );
}
