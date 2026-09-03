import Image from "next/image";
import Link from "next/link";
import { REPO_URL } from "@/lib/github";
import { GithubIcon } from "@/components/github-icon";
import { DiscordIcon } from "@/components/discord-icon";
import { ViewersMenu } from "@/components/viewers-menu";

const DISCORD_URL = "https://swiftlys2.net/discord";

const NAV = [
    { label: "docs", href: "/docs" },
    { label: "api", href: "/api-docs/stable" },
];

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
            <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 font-mono text-xs text-zinc-500 sm:px-6 sm:text-sm">
                <Image
                    src="/icon.png"
                    alt=""
                    width={18}
                    height={18}
                    className="shrink-0"
                />
                <Link href="/" className="font-semibold text-white">
                    swiftlys2
                </Link>
                {NAV.map((item) => (
                    <span key={item.href} className="flex items-center gap-3">
                        <span className="text-zinc-700">/</span>
                        <Link
                            href={item.href}
                            className="transition-colors hover:text-white"
                        >
                            {item.label}
                        </Link>
                    </span>
                ))}
                <span className="text-zinc-700">/</span>
                <ViewersMenu />

                <div className="ml-auto flex items-center gap-3 text-zinc-500">
                    <a
                        href={REPO_URL}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="GitHub"
                        className="transition-colors hover:text-white"
                    >
                        <GithubIcon className="h-4 w-4" />
                    </a>
                    <a
                        href={DISCORD_URL}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Discord"
                        className="transition-colors hover:text-white"
                    >
                        <DiscordIcon className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </header>
    );
}
