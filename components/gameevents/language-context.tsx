"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

export type GameEventsLanguage = "native" | "csharp";

const STORAGE_KEY = "gameevents-viewer-language";

const LanguageContext = createContext<{
    language: GameEventsLanguage;
    setLanguage: (language: GameEventsLanguage) => void;
} | null>(null);

export function GameEventsLanguageProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [language, setLanguage] = useState<GameEventsLanguage>("csharp");

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === "native" || stored === "csharp") {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setLanguage(stored);
            }
        } catch {}
    }, []);

    const update = (next: GameEventsLanguage) => {
        setLanguage(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {}
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: update }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useGameEventsLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error(
            "useGameEventsLanguage must be used within a GameEventsLanguageProvider",
        );
    }
    return ctx;
}
