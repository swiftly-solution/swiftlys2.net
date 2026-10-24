"use client";

import Link from "next/link";
import { REPO_URL } from "@/lib/github";
import { GithubIcon } from "@/components/github-icon";
import { DiscordIcon } from "@/components/discord-icon";
import { ViewersMenu } from "@/components/viewers-menu";

const DISCORD_URL = "https://swiftlys2.net/discord";

const NAV = [
    { label: "docs", href: "/docs" },
    { label: "api", href: "/api-docs/stable" },
    { label: "releases", href: "/releases" },
    { label: "features", href: "/features" },
    { label: "ai", href: "/ai" },
];

function Sep() {
    return <span className="text-zinc-700">/</span>;
}

export function HeaderNav() {
    return (
        <>
            {NAV.map((item) => (
                <span key={item.href} className="flex items-center gap-1.5">
                    <Sep />
                    <Link href={item.href} className="transition-colors hover:text-white">
                        {item.label}
                    </Link>
                </span>
            ))}

            <span className="flex items-center gap-1.5">
                <Sep />
                <ViewersMenu />
            </span>

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
        </>
    );
}
