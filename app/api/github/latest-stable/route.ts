import { NextResponse } from "next/server";
import { getLatestStableRelease } from "@/lib/github";

export async function GET() {
    const release = await getLatestStableRelease();
    return NextResponse.json(release);
}
