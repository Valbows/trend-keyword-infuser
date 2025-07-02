// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Optimized' API Route for YouTube Keyword Trends

import { NextResponse } from 'next/server';
import { trendDiscoveryService } from '@/lib/services/trendDiscoveryService';

// 'Elegant' and 'Xtensible' handler for GET requests
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');
  const timeframe = searchParams.get('timeframe') || '7d'; // Default to 7 days
  const publishedAfter = searchParams.get('publishedAfter') || undefined;
  const publishedBefore = searchParams.get('publishedBefore') || undefined;

  if (!topic) {
    return NextResponse.json(
      { success: false, message: 'Missing required query parameter: topic' },
      { status: 400 }
    );
  }

  try {
    console.info(
      `[API /trends/youtube-keywords] Fetching trends for topic: "${topic}"`
    );
    const trends = await trendDiscoveryService.findYouTubeKeywordTrends(
      topic,
      timeframe,
      publishedAfter,
      publishedBefore
    );

    console.info(
      `[API /trends/youtube-keywords] Found ${trends.length} trends.`
    );
    return NextResponse.json({ success: true, data: trends });
  } catch (error: unknown) {
    console.error(
      `[API /trends/youtube-keywords] Error fetching trends for topic "${topic}":`,
      error
    );
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'An internal server error occurred.',
      },
      { status: 500 }
    );
  }
}
