"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeftRight, ChevronsRightLeft } from "lucide-react";
import { REPO_URL } from "@/lib/github";
import { GithubIcon } from "@/components/github-icon";
import { DiscordIcon } from "@/components/discord-icon";
import { ViewersMenu, VIEWERS } from "@/components/viewers-menu";

const DISCORD_URL = "https://swiftlys2.net/discord";

const NAV = [
    { label: "docs", href: "/docs" },
    { label: "api", href: "/api-docs/stable" },
];

type Mode = "compact" | "expanded";

const STORAGE_KEY = "header-nav-mode";
const modeListeners = new Set<() => void>();

function readStoredMode(): Mode | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === "compact" || stored === "expanded" ? stored : null;
    } catch {
        return null;
    }
}

let storedMode: Mode | null =
    typeof window === "undefined" ? null : readStoredMode();

function setStoredMode(mode: Mode) {
    storedMode = mode;
    try {
        localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
    modeListeners.forEach((l) => l());
}

function subscribeMode(listener: () => void) {
    modeListeners.add(listener);
    return () => modeListeners.delete(listener);
}

const WIDE_QUERY = "(min-width: 640px)";

function subscribeWide(listener: () => void) {
    const mq = window.matchMedia(WIDE_QUERY);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
}

function Sep() {
    return <span className="text-zinc-700">/</span>;
}

export function HeaderNav() {
    const pathname = usePathname() ?? "";

    const mode = useSyncExternalStore(
        subscribeMode,
        () => storedMode,
        () => null,
    );
    const wide = useSyncExternalStore(
        subscribeWide,
        () => window.matchMedia(WIDE_QUERY).matches,
        () => false,
    );

    const resolvedExpanded = mode !== null ? mode === "expanded" : wide;

    const toggle = () =>
        setStoredMode(resolvedExpanded ? "compact" : "expanded");

    const showCompact = mode === null || mode === "compact";
    const showExpanded = mode === null || mode === "expanded";
    const compactVis = mode === null ? "sm:hidden" : "";
    const expandedVis = mode === null ? "hidden sm:flex" : "";

    return (
        <>
            {NAV.map((item) => (
                <span key={item.href} className="flex items-center gap-3">
                    <Sep />
                    <Link href={item.href} className="transition-colors hover:text-white">
                        {item.label}
                    </Link>
                </span>
            ))}

            {showCompact && (
                <span className={`flex items-center gap-3 ${compactVis}`}>
                    <Sep />
                    <ViewersMenu />
                </span>
            )}

            {showExpanded &&
                VIEWERS.map((viewer) => (
                    <span
                        key={viewer.href}
                        className={`flex items-center gap-3 ${expandedVis}`}
                    >
                        <Sep />
                        <Link
                            href={viewer.href}
                            className={`transition-colors hover:text-white ${
                                pathname.startsWith(viewer.href) ? "text-white" : ""
                            }`}
                        >
                            {viewer.label}
                        </Link>
                    </span>
                ))}

            <div className="ml-auto flex items-center gap-3 text-zinc-500">
                <button
                    type="button"
                    onClick={toggle}
                    aria-label={
                        resolvedExpanded
                            ? "Collapse viewer links"
                            : "Expand viewer links"
                    }
                    className="transition-colors hover:text-white"
                >
                    {resolvedExpanded ? (
                        <ChevronsRightLeft className="h-4 w-4" />
                    ) : (
                        <ChevronsLeftRight className="h-4 w-4" />
                    )}
                </button>
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
