import { NextResponse, type NextRequest } from "next/server";
import { getRecentReleases } from "@/lib/github";

export async function GET(request: NextRequest) {
    const limitParam = Number(request.nextUrl.searchParams.get("limit"));
    const limit =
        Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;
    const releases = await getRecentReleases(limit);
    return NextResponse.json(releases);
}
