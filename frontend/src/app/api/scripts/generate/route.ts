// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Optimized' API Route for Script Generation

import { NextResponse } from 'next/server';
import { scriptOrchestrationService } from '@/lib/services/scriptOrchestrationService';
import { YouTubeKeywordItem } from '@/lib/services/trendDiscoveryService';

interface GenerateScriptBody {
  topic: string;
  trends: YouTubeKeywordItem[];
}

// 'Elegant' and 'Xtensible' handler for POST requests
export async function POST(request: Request) {
  try {
    const body: GenerateScriptBody = await request.json();
    const { topic, trends = [] }: { topic: string; trends: YouTubeKeywordItem[] } = body;

    if (!topic) {
      return NextResponse.json(
        { success: false, message: 'Missing required field: topic' },
        { status: 400 }
      );
    }

    console.info(`[API /scripts/generate] Received request to generate script for topic: "${topic}"`);
    const newScript = await scriptOrchestrationService.orchestrateScriptCreation(topic, trends);
    console.info(`[API /scripts/generate] Successfully generated and saved script ID: ${newScript.id}`);

    return NextResponse.json({ success: true, data: newScript });

  } catch (error: unknown) {
    console.error('[API /scripts/generate] Error generating script:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred during script generation.';
    // 'Clairvoyant' error handling to provide specific feedback
    if (errorMessage.includes('GEMINI_API_KEY')) {
        return NextResponse.json(
            { success: false, message: 'AI service configuration error. Please contact an administrator.' },
            { status: 500 }
        );
    }
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
