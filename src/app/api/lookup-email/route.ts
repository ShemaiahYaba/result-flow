import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ALLOWED_ID_TYPES = ['matric_number', 'staff_id'] as const;
type IdType = typeof ALLOWED_ID_TYPES[number];

export async function POST(req: NextRequest) {
  console.log('=== /api/lookup-email POST request received ===');
  
  try {
    // Log request details
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Parse and validate request body
    const body = await req.json();
    console.log('Request body received:', body);
    console.log('Request body type:', typeof body);
    console.log('Request body keys:', Object.keys(body));
    
    const { idType, idValue } = body;
    console.log('Extracted values:', { idType, idValue });
    console.log('idType type:', typeof idType);
    console.log('idValue type:', typeof idValue);
    
    // Validate idType
    if (!ALLOWED_ID_TYPES.includes(idType)) {
      console.log('❌ Invalid idType:', idType);
      console.log('Allowed types:', ALLOWED_ID_TYPES);
      return NextResponse.json({ 
        error: 'Invalid idType', 
        received: idType, 
        allowed: ALLOWED_ID_TYPES 
      }, { status: 400 });
    }
    console.log('✅ idType validation passed:', idType);
    
    // Validate idValue
    if (typeof idValue !== 'string' || !idValue.trim()) {
      console.log('❌ Invalid idValue:', idValue);
      return NextResponse.json({ 
        error: 'Invalid idValue', 
        received: idValue, 
        type: typeof idValue 
      }, { status: 400 });
    }
    console.log('✅ idValue validation passed:', idValue);
    
    // Check environment variables
    console.log('Environment check:');
    console.log('- SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('- SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
    console.log('Service role key length:', SERVICE_ROLE_KEY?.length);
    
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.log('❌ Missing required environment variables');
      return NextResponse.json({ 
        error: 'Server configuration error', 
        missing: {
          supabaseUrl: !SUPABASE_URL,
          serviceRoleKey: !SERVICE_ROLE_KEY
        }
      }, { status: 500 });
    }
    
    // Initialize Supabase with service role key
    console.log('Initializing Supabase client...');
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    console.log('✅ Supabase client initialized');
    
    // Log the query we're about to execute
    console.log('Executing query:');
    console.log('- Table: profiles');
    console.log('- Select: email');
    console.log('- Where:', `${idType} = '${idValue}'`);
    
    // Query profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq(idType, idValue)
      .maybeSingle();
    
    console.log('Query result:');
    console.log('- Data:', data);
    console.log('- Error:', error);
    
    if (error) {
      console.error('❌ Supabase DB error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }
    
    if (!data || !data.email) {
      console.log('❌ No profile found for:', { idType, idValue });
      console.log('Returned data:', data);
      return NextResponse.json({ 
        error: 'Identifier not found', 
        searched: { idType, idValue },
        returned: data
      }, { status: 404 });
    }
    
    console.log('✅ Profile found, email:', data.email);
    console.log('=== /api/lookup-email success ===');
    
    return NextResponse.json({ email: data.email });
    
  } catch (parseError: any) {
    console.error('❌ Request parsing error:', parseError);
    console.error('Error details:', {
      message: parseError.message,
      stack: parseError.stack,
      name: parseError.name
    });
    return NextResponse.json({ 
      error: 'Invalid request', 
      details: parseError.message,
      type: parseError.name
    }, { status: 400 });
  }
}

export function GET() {
  console.log('❌ GET method not allowed on /api/lookup-email');
  return NextResponse.json({ 
    error: 'Method Not Allowed',
    allowed: ['POST'],
    received: 'GET'
  }, { status: 405 });
}

export function PUT() {
  console.log('❌ PUT method not allowed on /api/lookup-email');
  return NextResponse.json({ 
    error: 'Method Not Allowed',
    allowed: ['POST'],
    received: 'PUT'
  }, { status: 405 });
}

export function DELETE() {
  console.log('❌ DELETE method not allowed on /api/lookup-email');
  return NextResponse.json({ 
    error: 'Method Not Allowed',
    allowed: ['POST'],
    received: 'DELETE'
  }, { status: 405 });
}
