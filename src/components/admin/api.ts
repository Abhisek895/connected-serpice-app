export const getAdminToken = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )admin_token=([^;]+)'));
  return match ? match[2] : null;
};

// Remove unused BACKEND_URL

export async function adminFetch(endpoint: string, options: RequestInit = {}) {
  // We don't read the cookie on client side for admin_token because it is httpOnly.
  // Instead we let the browser attach the cookie to same-site requests...
  // BUT the API is running on localhost:3003 (cross-origin).
  // Wait, if it's cross-origin, we can use a Next.js API proxy, OR just pass credentials if CORS allows.
  // Since we are proxying, it's better to proxy all admin API requests through Next.js API routes, 
  // OR rely on Next.js to forward it, OR we don't set it httpOnly and send it manually.
  
  // Let's proxy through a general Next.js catch-all route OR just use standard fetch 
  // with credentials if the backend allows it.
  
  // Wait, VibePass uses standard JWT via Authorization header.
  // Let's fetch it via a proxy to keep the token httpOnly, or just fetch directly if not.
  // Actually, for simplicity in this admin panel, let's just make the Next.js API route act as a forwarder.
  // We'll create `src/app/api/admin/proxy/[...path]/route.ts`.
  
  const res = await fetch(`/api/admin/proxy/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 401 || res.status === 403) {
    console.error("Admin API Unauthorized");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  return res.json();
}
