import { NextResponse } from 'next/server';
import { engagementRecordingService } from '@/lib/services/engagementRecordingService';

/**
 * Handler for recording YouTube engagement metrics
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // In recent Next.js versions, params is a promise that must be awaited.
  const { id } = await context.params;

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

    const updatedScript = await engagementRecordingService.recordEngagement(
      id,
      videoUrl
    );

    return NextResponse.json({ success: true, data: updatedScript });
  } catch (error: unknown) {
    // Specific check for Supabase/Postgres unique constraint violation
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: unknown }).code === '23505'
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'This YouTube video has already been linked to another script.',
        },
        { status: 409 }
      );
    }

    // General error handling
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
