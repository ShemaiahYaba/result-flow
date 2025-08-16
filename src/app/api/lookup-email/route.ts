import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ALLOWED_ID_TYPES = ['matric_number', 'staff_id'] as const;
type IdType = typeof ALLOWED_ID_TYPES[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idType, idValue } = body;

    // Validate idType
    if (!ALLOWED_ID_TYPES.includes(idType)) {
      return NextResponse.json({ error: 'Invalid idType' }, { status: 400 });
    }
    if (typeof idValue !== 'string' || !idValue.trim()) {
      return NextResponse.json({ error: 'Invalid idValue' }, { status: 400 });
    }

    // Initialize Supabase with service role key (server only)
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Query profiles table for the email
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq(idType, idValue)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    if (!data || !data.email) {
      return NextResponse.json({ error: 'Identifier not found' }, { status: 404 });
    }

    return NextResponse.json({ email: data.email });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
