// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Optimized' API Route for Specific Script Operations

import { NextResponse } from 'next/server';
import { scriptService } from '@/lib/services/scriptService';

interface RouteParams {
  params: { id: string };
}

interface UpdateScriptBody {
  title: string;
  content: string;
}

/**
 * 'Elegant' and 'Xtensible' handler for fetching a single script by its ID.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ success: false, message: 'Invalid script ID.' }, { status: 400 });
  }

  try {
    console.info(`[API /scripts/{id}] Fetching script with ID: ${id}`);
    const script = await scriptService.getScriptById(id);

    if (!script) {
      console.warn(`[API /scripts/{id}] Script with ID ${id} not found.`);
      return NextResponse.json({ success: false, message: 'Script not found.' }, { status: 404 });
    }

    console.info(`[API /scripts/{id}] Successfully fetched script with ID: ${id}`);
    return NextResponse.json({ success: true, data: script });

  } catch (error: unknown) {
    console.error(`[API /scripts/{id}] Error fetching script ${id}:`, error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}

/**
 * 'Durable' and 'Optimized' handler for updating a script's content and title.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ success: false, message: 'Invalid script ID.' }, { status: 400 });
  }

  try {
    const body: UpdateScriptBody = await request.json();
    const { title, content } = body;

    if (!title && !content) {
        return NextResponse.json({ success: false, message: 'No update data provided. Please provide title and/or content.' }, { status: 400 });
    }

    console.info(`[API /scripts/{id}] Updating script with ID: ${id}`);
    const updatedScript = await scriptService.updateScript(id, { title, content });
    console.info(`[API /scripts/{id}] Successfully updated script with ID: ${id}`);

    return NextResponse.json({ success: true, data: updatedScript });

  } catch (error: unknown) {
    console.error(`[API /scripts/{id}] Error updating script ${id}:`, error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
