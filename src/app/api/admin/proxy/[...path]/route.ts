import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3003';
const SERVICE_TOKEN = process.env.VIBEPASS_SERVICE_TOKEN;

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

async function handleProxy(req: NextRequest, path: string[]) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    
    if (!session || (userRole !== 'super_admin' && userRole !== 'admin' && userRole !== 'moderator')) {
      return NextResponse.json({ error: 'Unauthorized local session' }, { status: 401 });
    }

    if (!SERVICE_TOKEN) {
      console.error('Missing VIBEPASS_SERVICE_TOKEN in env');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const searchParams = req.nextUrl.search;
    const url = `${BACKEND_URL}/api/v1/admin-panel/${path.join('/')}${searchParams}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${SERVICE_TOKEN}`,
    };
    
    const contentType = req.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    const options: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await req.text();
      if (body) {
        options.body = body;
      }
    }

    const backendRes = await fetch(url, options);
    
    // Pass back exactly what backend sends
    const data = await backendRes.text();
    let json;
    try {
      json = JSON.parse(data);
    } catch {
      json = data;
    }

    return NextResponse.json(json, { status: backendRes.status });
  } catch (error) {
    console.error('Admin proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
