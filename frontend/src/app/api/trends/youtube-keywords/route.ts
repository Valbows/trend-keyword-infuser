// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Optimized' API Route for YouTube Keyword Trends

import { NextResponse } from 'next/server';
import { trendDiscoveryService } from '@/lib/services/trendDiscoveryService';

// 'Elegant' and 'Xtensible' handler for GET requests
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, timeframe = '7d', publishedAfter, publishedBefore } = body;

    if (!topic) {
      return NextResponse.json(
        { success: false, message: 'Missing required body parameter: topic' },
        { status: 400 }
      );
    }

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
    // D.R.Y. - 'Resilient' error handling
    console.error(
      '[API /trends/youtube-keywords] Error fetching trends:',
      error
    );

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }

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
