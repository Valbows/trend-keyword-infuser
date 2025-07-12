import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { scriptId, content, keywords } = await request.json();

  if (!scriptId) {
    return new NextResponse(JSON.stringify({ error: 'scriptId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!content) {
    return new NextResponse(JSON.stringify({ error: 'content is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const updateData: {
    generated_script: string;
    keywords?: string[];
    updated_at: string;
  } = {
    generated_script: content,
    updated_at: new Date().toISOString(),
  };

  if (keywords) {
    updateData.keywords = keywords;
  }

  const { data, error } = await supabase
    .from('scripts')
    .update(updateData)
    .eq('id', scriptId)
    .select()
    .single();

  if (error) {
    console.error('Error updating script:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return NextResponse.json(data);
}
