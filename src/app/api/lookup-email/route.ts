import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../utils/supabase/server';

const ALLOWED_ID_TYPES = ['matric_number', 'staff_id', 'admin_id'] as const;
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
    
    // Initialize Supabase with service role key
    console.log('Initializing Supabase service client...');
    let supabase: any;
    try {
      supabase = createServiceClient();
      console.log('✅ Supabase service client initialized');
    } catch (error: any) {
      console.log('❌ Failed to initialize Supabase service client:', error.message);
      return NextResponse.json({ 
        error: 'Server configuration error', 
        details: error.message
      }, { status: 500 });
    }
    
    // Log the query we're about to execute
    console.log('Executing query for new schema:');
    console.log('- Looking up:', `${idType} = '${idValue}'`);
    
    let data = null;
    let error = null;
    
    // Query appropriate entity table based on ID type
    if (idType === 'matric_number') {
      console.log('- Querying students table for matric_number');
      const result = await supabase
        .from('students')
        .select('email')
        .eq('matric_number', idValue)
        .maybeSingle();
      
      if (result.data) {
        data = { email: result.data.email, role: 'student' };
      }
      error = result.error;
      
    } else if (idType === 'staff_id') {
      console.log('- Querying HODs table for staff_id');
      const hodResult = await supabase
        .from('hods')
        .select('email')
        .eq('staff_id', idValue)
        .maybeSingle();
      
      if (hodResult.data) {
        data = { email: hodResult.data.email, role: 'hod' };
      }
      error = hodResult.error;
      
    } else if (idType === 'admin_id') {
      console.log('- Querying admins table for admin_id');
      const adminResult = await supabase
        .from('admins')
        .select('email')
        .eq('admin_id', idValue)
        .maybeSingle();
      
      if (adminResult.data) {
        data = { email: adminResult.data.email, role: 'admin' };
      }
      error = adminResult.error;
    }
    
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
    
    console.log('✅ Profile found, email:', data.email, 'role:', data.role);
    console.log('=== /api/lookup-email success ===');
    
    return NextResponse.json({ email: data.email, role: data.role });
    
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
