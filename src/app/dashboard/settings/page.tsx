import { Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  let userId = session?.user?.id;

  // Fallback to dummy user for local dev if not logged in
  if (!userId) {
    const dummyUser = await prisma.user.findFirst({ where: { email: "test@example.com" } });
    userId = dummyUser?.id;
  }

  // Fetch user data
  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
    });
  }

  // Mock data if user is missing
  const userProps = {
    displayName: user?.name || "Test User",
    displayEmail: user?.email || "test@example.com",
    plan: user?.plan || "FREE",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="text-rose-500" />
          Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and billing.</p>
      </div>

      <SettingsClient user={userProps} />
    </div>
  );
}
