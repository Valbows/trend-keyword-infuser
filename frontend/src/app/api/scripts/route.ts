// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Optimized' API Route for Fetching All Scripts

import { NextResponse } from 'next/server';
import { scriptService } from '@/lib/services/scriptService';

// 'Elegant' and 'Xtensible' handler for GET requests
export async function GET(request: Request) {
  try {
    console.info('[API /scripts] Fetching all scripts.');
    const scripts = await scriptService.getAllScripts();
    console.info(`[API /scripts] Successfully fetched ${scripts.length} scripts.`);

    return NextResponse.json({ success: true, data: scripts });

  } catch (error: any) {
    console.error('[API /scripts] Error fetching all scripts:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
