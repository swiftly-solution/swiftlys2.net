export function SiteFooter() {
    return (
        <footer className="mt-24 border-t border-white/10">
            <div className="mx-auto max-w-6xl px-6 py-8">
                <div className="flex flex-col justify-between gap-2 text-xs text-zinc-600 md:flex-row">
                    <span>
                        © {new Date().getFullYear()} SwiftlyLabs.net - licensed
                        GPLv3
                    </span>
                    <span>
                        swiftlys2.net is a hobby project, not affiliated with
                        Valve Corp.
                    </span>
                </div>
            </div>
        </footer>
    );
}
