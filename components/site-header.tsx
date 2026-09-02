import Image from "next/image";
import Link from "next/link";
import { REPO_URL } from "@/lib/github";

const DISCORD_URL = "https://swiftlys2.net/discord";

const CRUMBS = [
    { label: "docs", href: "/docs" },
    { label: "github", href: REPO_URL },
    { label: "discord", href: DISCORD_URL },
    { label: "schema", href: "/schema-viewer" },
    { label: "convars", href: "/convars-viewer" },
    { label: "entity", href: "/entity-viewer" },
    { label: "protobuf", href: "/protobuf-viewer" },
];

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
            <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 font-mono text-xs text-zinc-500 sm:px-6 sm:text-sm">
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
                    <span key={crumb.label} className="flex items-center gap-2">
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
        </header>
    );
}
