import { redirect } from "next/navigation";
import { DEFAULT_GAME_ID } from "@/lib/schema/games";

export default function ProtobufViewerIndex() {
    redirect(`/protobuf-viewer/${DEFAULT_GAME_ID}`);
}
