"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export default function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AdminUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user && ((session.user as any).role === "super_admin" || (session.user as any).role === "admin" || (session.user as any).role === "moderator")) {
      setUser({
        id: session.user.id as string,
        email: session.user.email as string,
        username: session.user.name as string,
        role: (session.user as any).role,
      });
    } else {
      router.push("/");
    }
  }, [session, status, router]);

  const logout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, isLoading: status === "loading", logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
