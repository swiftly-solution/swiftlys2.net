import Link from "next/link";
import { TerminalWindow } from "@/components/terminal-window";
import { REPO_URL } from "@/lib/github";

export function Hero({
    latestBeta,
    latestStable,
}: {
    latestBeta: string | null;
    latestStable: string | null;
}) {
    const badgeParts = [
        latestBeta && `${latestBeta} beta`,
        latestStable && `${latestStable} stable`,
    ].filter(Boolean);
    const badgeText =
        badgeParts.length > 0 ? badgeParts.join(" · ") : "actively shipping";

    return (
        <section className="relative overflow-hidden px-6 pb-20 pt-24">
            <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                    maskImage:
                        "radial-gradient(ellipse 60% 50% at 50% 20%, black, transparent)",
                }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden">
                <div
                    className="animate-drift-a absolute left-1/2 top-0 h-[420px] w-[620px] -translate-x-1/2 rounded-full blur-3xl"
                    style={{ background: "rgba(255,140,60,0.18)" }}
                />
                <div
                    className="animate-drift-b absolute left-1/2 top-10 h-[360px] w-[520px] -translate-x-1/2 rounded-full blur-3xl"
                    style={{ background: "rgba(0,254,237,0.12)" }}
                />
            </div>

            <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs text-zinc-400">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                        </span>
                        {badgeText}
                    </div>

                    <h1 className="mt-8 text-3xl font-bold tracking-tight text-zinc-300 sm:text-4xl lg:text-5xl">
                        A C# framework for{" "}
                        <span className="text-accent">Source 2</span> servers.
                    </h1>

                    <p className="mt-6 max-w-lg text-lg text-zinc-500">
                        Build modern Counter-Strike 2 plugins with the full
                        power of .NET - hot reload, async/await, and native
                        engine access. No wrappers, no compromises.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link
                            href="/docs"
                            className="flex h-11 items-center gap-1.5 rounded-lg bg-accent px-5 font-mono text-sm font-medium text-black transition-all hover:-translate-y-0.5 hover:opacity-90"
                        >
                            <span className="opacity-70">&gt;</span> get started
                        </Link>
                        <Link
                            href={REPO_URL}
                            className="flex h-11 items-center rounded-lg border border-white/10 bg-white/5 px-5 font-mono text-sm font-medium text-zinc-200 transition-all hover:-translate-y-0.5 hover:border-white/20"
                        >
                            view on github
                        </Link>
                    </div>
                </div>

                <TerminalWindow title="bash - swiftlys2">
                    <p>
                        <span className="text-accent">~/plugins $</span>{" "}
                        <span className="text-zinc-300">
                            dotnet new install SwiftlyS2.CS2.PluginTemplate
                        </span>
                    </p>
                    <p className="text-zinc-500">
                        Success: SwiftlyS2.CS2.PluginTemplate installed.
                    </p>
                    <p className="mt-2">
                        <span className="text-accent">~/plugins $</span>{" "}
                        <span className="text-zinc-300">
                            dotnet new swplugin -n &quot;TestPlugin&quot;
                            --PluginAuthor &quot;Anonymous&quot;
                        </span>
                    </p>
                    <p className="text-zinc-500">
                        The template &quot;SwiftlyS2 CS2 Plugin&quot; was
                        created successfully.
                    </p>
                    <p className="mt-2">
                        <span className="text-accent">
                            ~/plugins/TestPlugin $
                        </span>{" "}
                        <span className="text-zinc-300">dotnet publish</span>
                    </p>
                    <p className="text-zinc-500">
                        Build succeeded → build/publish/TestPlugin.dll
                    </p>
                    <p className="mt-2">
                        <span className="text-accent">
                            ~/plugins/TestPlugin $
                        </span>{" "}
                        <span className="animate-pulse text-zinc-300">▌</span>
                    </p>
                </TerminalWindow>
            </div>
        </section>
    );
}
