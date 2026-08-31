import Image from "next/image";
import Link from "next/link";
import { REPO_URL } from "@/lib/github";

const DISCORD_URL = "https://swiftlys2.net/discord";

const CRUMBS = [
    { label: "docs", href: "/docs" },
    { label: "github", href: REPO_URL },
    { label: "discord", href: DISCORD_URL },
];

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 font-mono text-sm">
                <div className="flex items-center gap-2 text-zinc-500">
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
                    {CRUMBS.map((crumb) => (
                        <span
                            key={crumb.label}
                            className="flex items-center gap-2"
                        >
                            <span className="text-zinc-700">/</span>
                            <Link
                                href={crumb.href}
                                className="transition-colors hover:text-white"
                            >
                                {crumb.label}
                            </Link>
                        </span>
                    ))}
                </div>
            </div>
        </header>
    );
}
