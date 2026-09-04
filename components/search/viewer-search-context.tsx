"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type ViewerSearchContextValue = {
    query: string;
    setQuery: (query: string) => void;
};

const ViewerSearchContext = createContext<ViewerSearchContextValue | null>(
    null,
);

export function useViewerSearch(): ViewerSearchContextValue {
    const ctx = useContext(ViewerSearchContext);
    if (!ctx) {
        throw new Error("useViewerSearch must be used within ViewerSearchProvider");
    }
    return ctx;
}

export function ViewerSearchProvider({ children }: { children: ReactNode }) {
    const [query, setQuery] = useState("");

    useEffect(() => {
        const q = new URLSearchParams(window.location.search).get("q");
        if (q) setQuery(q);
    }, []);

    const value = useMemo<ViewerSearchContextValue>(
        () => ({ query, setQuery }),
        [query],
    );

    return (
        <ViewerSearchContext.Provider value={value}>
            {children}
        </ViewerSearchContext.Provider>
    );
}
