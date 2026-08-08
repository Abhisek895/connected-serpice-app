import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const { userId } = await getCurrentUser();

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
