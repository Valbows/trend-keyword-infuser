// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Optimized' API Route for Fetching All Scripts

import { NextResponse } from 'next/server';
import { scriptService } from '@/lib/services/scriptService';

// 'Elegant' and 'Xtensible' handler for GET requests
export async function GET(_request: Request) {
  try {
    console.info('[API /scripts] Fetching all scripts.');
    const scripts = await scriptService.getAllScripts();
    console.info(
      `[API /scripts] Successfully fetched ${scripts.data?.length || 0} scripts.`
    );

    // Return the ServiceResponse object directly as it already has the correct structure
    return NextResponse.json(scripts);
  } catch (error: unknown) {
    console.error('[API /scripts] Error fetching all scripts:', error);
    // Create an error response that follows the ServiceResponse pattern
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: `Failed to fetch scripts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 500
      },
      { status: 500 }
    );
  }
}
