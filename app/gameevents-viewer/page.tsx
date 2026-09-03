import { redirect } from "next/navigation";
import { DEFAULT_GAME_ID } from "@/lib/schema/games";

export default function GameEventsViewerIndex() {
    redirect(`/gameevents-viewer/${DEFAULT_GAME_ID}`);
}
