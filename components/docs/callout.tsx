import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const STYLES = {
    info: {
        border: "border-sky-500/30",
        bg: "bg-sky-500/10",
        text: "text-sky-300",
        icon: Info,
    },
    warning: {
        border: "border-amber-500/30",
        bg: "bg-amber-500/10",
        text: "text-amber-300",
        icon: AlertTriangle,
    },
    error: {
        border: "border-rose-500/30",
        bg: "bg-rose-500/10",
        text: "text-rose-300",
        icon: XCircle,
    },
    success: {
        border: "border-accent/30",
        bg: "bg-accent/10",
        text: "text-accent",
        icon: CheckCircle2,
    },
} as const;

export function Callout({
    type = "info",
    children,
}: {
    type?: keyof typeof STYLES;
    children: ReactNode;
}) {
    const style = STYLES[type] ?? STYLES.info;
    const Icon = style.icon;

    return (
        <div
            className={`my-4 flex gap-3 rounded-xl border ${style.border} ${style.bg} p-4 text-sm ${style.text}`}
        >
            <Icon className="h-5 w-5 shrink-0" />
            <div className="[&>p]:m-0">{children}</div>
        </div>
    );
}
