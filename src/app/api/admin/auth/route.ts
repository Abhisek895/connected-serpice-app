import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3003';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Call VibePass backend login
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Login failed' }, { status: res.status });
    }

    // Verify user role
    const { user, accessToken } = data;
    if (!['admin', 'super_admin', 'moderator'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized role for admin panel' }, { status: 403 });
    }

    // Create response and set cookie
    const response = NextResponse.json({ success: true, user });
    
    response.cookies.set({
      name: 'admin_token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Also store role in a non-httpOnly cookie so frontend can check quickly
    response.cookies.set({
      name: 'admin_role',
      value: user.role,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  response.cookies.delete('admin_role');
  return response;
}
