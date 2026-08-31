import { NextResponse } from "next/server";
import { getRepoStats } from "@/lib/github";

export async function GET() {
    const stats = await getRepoStats();
    return NextResponse.json(stats);
}
