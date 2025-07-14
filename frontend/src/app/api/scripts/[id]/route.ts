// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Optimized' API Route for Specific Script Operations

import { NextResponse } from 'next/server';
import { scriptService } from '@/lib/services/scriptService';

interface UpdateScriptBody {
  title: string;
  content: string;
}

/**
 * 'Elegant' and 'Xtensible' handler for fetching a single script by its ID.
 * Uses URL path extraction to avoid Next.js 15.3.3 type issues.
 */
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    console.info(`[API /scripts/{id}] Fetching script with ID: ${id}`);
    const script = await scriptService.getScriptById(id);

    if (!script) {
      console.warn(`[API /scripts/{id}] Script with ID ${id} not found.`);
      return NextResponse.json(
        { success: false, message: 'Script not found.' },
        { status: 404 }
      );
    }

    console.info(
      `[API /scripts/{id}] Successfully fetched script with ID: ${id}`
    );
    return NextResponse.json({ success: true, data: script });
  } catch (error: unknown) {
    console.error(`[API /scripts/{id}] Error fetching script ${id}:`, error);
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

/**
 * 'Durable' and 'Optimized' handler for updating a script's content and title.
 * Uses URL path extraction to avoid Next.js 15.3.3 type issues.
 */
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const body: UpdateScriptBody = await request.json();
    const { title, content } = body;

    if (!title && !content) {
      return NextResponse.json(
        {
          success: false,
          message:
            'No update data provided. Please provide title and/or content.',
        },
        { status: 400 }
      );
    }

    console.info(`[API /scripts/{id}] Updating script with ID: ${id}`);
    const updatedScript = await scriptService.updateScript(id, {
      topic: title, // Assuming 'title' maps to 'topic'
      generated_script: content, // Assuming 'content' maps to 'generated_script'
    });
    console.info(
      `[API /scripts/{id}] Successfully updated script with ID: ${id}`
    );

    return NextResponse.json({ success: true, data: updatedScript });
  } catch (error: unknown) {
    console.error(`[API /scripts/{id}] Error updating script ${id}:`, error);
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
