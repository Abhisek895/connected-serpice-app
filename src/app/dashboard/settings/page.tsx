import { Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./SettingsClient";

import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  let userId = session?.user?.id;

  if (!userId && session?.user?.email) {
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    userId = dbUser?.id;
  }

  if (!userId) {
    redirect("/login");
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Fetch dynamic upgrade to premium price
  const premiumSetting = await prisma.systemSetting.findUnique({
    where: { key: "premium_upgrade_price" },
  });
  const premiumUpgradePrice = premiumSetting?.value ? parseInt(premiumSetting.value, 10) : 5000;

  const userProps = {
    displayName: user?.name || "User",
    displayEmail: user?.email || "",
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

      <SettingsClient user={userProps} premiumUpgradePrice={premiumUpgradePrice} />
    </div>
  );
}
