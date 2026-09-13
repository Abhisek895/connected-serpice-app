import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const { userId } = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  const events = await prisma.event.findMany({
    where: userId ? { userId } : undefined,
    include: {
      theme: true,
      responses: {
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return <NotificationsClient events={events as any} />;
}
