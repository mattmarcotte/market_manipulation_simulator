import { NextResponse } from "next/server";
import { getFeed } from "@/lib/social-feed";
import { getRecentAdjustments } from "@/lib/market-adjustments";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    posts: getFeed(50),
    adjustments: getRecentAdjustments(20),
  });
}
