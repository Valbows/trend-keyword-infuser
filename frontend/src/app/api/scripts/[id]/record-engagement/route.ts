// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Optimized' API Route for Recording YouTube Engagement

import { NextResponse } from 'next/server';
import { engagementRecordingService } from '@/lib/services/engagementRecordingService';

interface RouteParams {
  params: { id: string };
}

/**
 * 'Elegant' and 'Xtensible' handler for recording YouTube engagement for a script.
 */
export async function POST(request: Request, { params }: RouteParams) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ success: false, message: 'Invalid script ID.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json({ success: false, message: 'Missing required field: videoUrl' }, { status: 400 });
    }

    console.info(`[API /record-engagement] Received request for script ID: ${id}`);
    const updatedScript = await engagementRecordingService.recordEngagement(id, videoUrl);
    console.info(`[API /record-engagement] Successfully recorded engagement for script ID: ${id}`);

    return NextResponse.json({ success: true, data: updatedScript });

  } catch (error: any) {
    console.error(`[API /record-engagement] Error recording engagement for script ${id}:`, error);
    return NextResponse.json(
      { success: false, message: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
