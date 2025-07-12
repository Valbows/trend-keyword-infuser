import { NextResponse } from 'next/server';
import { engagementRecordingService } from '@/lib/services/engagementRecordingService';

/**
 * Handler for recording YouTube engagement metrics
 * Uses a single request parameter approach to avoid Next.js 15.3.3 type issues
 */
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = await Promise.resolve(context);
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Invalid script ID.' },
      { status: 400 }
    );
  }

  try {
    const body: { videoUrl: string } = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing required field: videoUrl' },
        { status: 400 }
      );
    }

    console.info(
      `[API /record-engagement] Received request for script ID: ${id}`
    );
    const updatedScript = await engagementRecordingService.recordEngagement(
      id,
      videoUrl
    );
    console.info(
      `[API /record-engagement] Successfully recorded engagement for script ID: ${id}`
    );

    return NextResponse.json({ success: true, data: updatedScript });
  } catch (error: unknown) {
    console.error(
      `[API /record-engagement] Error recording engagement for script ${id}:`,
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
