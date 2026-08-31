import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/github-icon";
import { REPO_URL } from "@/lib/github";

export function DeveloperCta() {
    return (
        <section className="mx-auto mt-20 max-w-6xl px-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 px-8 py-14 text-center">
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div
                        className="animate-drift-a absolute left-1/2 top-1/2 h-[360px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                        style={{ background: "rgba(0,254,237,0.14)" }}
                    />
                </div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                    Build your first plugin
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-zinc-500">
                    Write it in C#, run it against the real C++ core. Every
                    capability above is one import away.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/docs"
                        className="group flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-black transition-all hover:-translate-y-0.5 hover:opacity-90"
                    >
                        Read the docs
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <Link
                        href={REPO_URL}
                        className="flex h-11 items-center gap-2 rounded-lg border border-white/10 px-5 text-sm font-medium text-zinc-200 transition-all hover:-translate-y-0.5 hover:border-white/20"
                    >
                        <GithubIcon className="h-4 w-4" />
                        View on GitHub
                    </Link>
                </div>
            </div>
        </section>
    );
}
