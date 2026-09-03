import type { ApiBranch, ApiMember } from "@/lib/api-docs/types";
import { slugify, type UidIndexEntry } from "@/lib/api-docs/tree";
import type { SchemaProjectIndex } from "@/lib/api-docs/schema-links";
import { MemberCard } from "@/components/api-docs/member-card";

export function MemberSection({
    title,
    members,
    branch,
    uidIndex,
    schemaIndex,
}: {
    title: string;
    members: ApiMember[] | undefined;
    branch: ApiBranch;
    uidIndex: Map<string, UidIndexEntry>;
    schemaIndex: SchemaProjectIndex;
}) {
    if (!members || members.length === 0) return null;

    const valueLabel =
        title === "Properties"
            ? "Property Value"
            : title === "Fields"
              ? "Field Value"
              : "Value";

    return (
        <section id={slugify(title)} className="mt-10 scroll-mt-24">
            <h2 className="font-mono text-2xl font-bold text-white">{title}</h2>
            <div className="mt-2">
                {members.map((member) => (
                    <MemberCard
                        key={member.uid}
                        member={member}
                        branch={branch}
                        uidIndex={uidIndex}
                        schemaIndex={schemaIndex}
                        valueLabel={valueLabel}
                    />
                ))}
            </div>
        </section>
    );
}
