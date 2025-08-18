import { NextRequest, NextResponse } from 'next/server';
import { makeRoute } from '@/lib/api/routeFactory';
import { z } from 'zod';

const responseSchema = z.object({
  role: z.string(),
  user_entity_id: z.string()
});

export const GET = makeRoute({
  method: 'GET',
  requireAuth: true,
  output: responseSchema,
  handle: async (ctx: { user: { role?: string; user_entity_id?: string } }) => {
    // Return user profile data from authenticated user context
    return {
      role: ctx.user.role || '',
      user_entity_id: ctx.user.user_entity_id || ''
    };
  }
});
