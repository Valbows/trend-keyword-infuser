// /app/api/scripts/infuse/route.ts
import { NextResponse } from 'next/server';
import {
  infuseKeywordsIntoScript,
} from '@/lib/services/scriptGenerationService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { existingContent, keywords } = body;

    if (!existingContent || !keywords) {
      return NextResponse.json(
        { error: 'Missing existingContent or keywords in request body' },
        { status: 400 }
      );
    }

    const modifiedScript = await infuseKeywordsIntoScript(
      existingContent,
      keywords
    );

    return NextResponse.json({ modifiedScript });
  } catch (error) {
    console.error('[API /infuse] Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: `Failed to infuse keywords: ${errorMessage}` },
      { status: 500 }
    );
  }
}
