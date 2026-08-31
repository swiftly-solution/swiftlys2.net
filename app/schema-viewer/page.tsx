import { redirect } from "next/navigation";
import { DEFAULT_GAME_ID } from "@/lib/schema/games";

export default function SchemaViewerIndex() {
    redirect(`/schema-viewer/${DEFAULT_GAME_ID}`);
}
