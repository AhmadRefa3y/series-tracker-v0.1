import { NextRequest, NextResponse } from "next/server";

import { getSeasonImdbRatings } from "@/lib/imdb";

/**
 * IMDb ratings for one season of a series, keyed by episode number.
 *
 * The underlying OMDb lookup is cached server-side for a day, so repeated
 * tab switches / pagination are free. Unauthenticated reads are fine: this
 * exposes only public rating data.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const seriesId = searchParams.get("seriesId");
  const seasonNumber = Number(searchParams.get("season"));

  if (!seriesId || !Number.isInteger(seasonNumber) || seasonNumber < 1) {
    return NextResponse.json(
      { error: "seriesId and a positive integer season are required" },
      { status: 400 }
    );
  }

  const ratings = await getSeasonImdbRatings(seriesId, seasonNumber);

  return NextResponse.json(
    { ratings: Object.fromEntries(ratings) },
    {
      // Ratings change rarely; let the browser reuse responses in-session.
      headers: {
        "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}
