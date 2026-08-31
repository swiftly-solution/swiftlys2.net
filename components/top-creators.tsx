import Image from "next/image";
import Link from "next/link";
import type { Contributor } from "@/lib/github";

export function TopCreators({ contributors }: { contributors: Contributor[] }) {
    if (contributors.length === 0) return null;

    return (
        <section id="creators" className="mx-auto mt-20 max-w-6xl px-6">
            <h2 className="text-2xl font-bold text-white">Top creators</h2>

            <div className="mt-6 grid grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-zinc-950/40 p-6 sm:grid-cols-2 md:grid-cols-4">
                {contributors.map((contributor) => (
                    <Link
                        key={contributor.login}
                        href={contributor.url}
                        className="group flex items-center gap-3"
                    >
                        <Image
                            src={contributor.avatarUrl}
                            alt={contributor.login}
                            width={36}
                            height={36}
                            className="rounded-full border border-white/10 transition-transform duration-200 group-hover:scale-110 group-hover:border-accent/40"
                        />
                        <div>
                            <div className="text-sm font-medium text-white">
                                {contributor.login}
                            </div>
                            <div className="font-mono text-xs text-accent">
                                {contributor.contributions} commits
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
