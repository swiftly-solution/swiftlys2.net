import Image from "next/image";
import Link from "next/link";
import { HeaderNav } from "@/components/header-nav";

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
                <HeaderNav />
            </div>
        </header>
    );
}
