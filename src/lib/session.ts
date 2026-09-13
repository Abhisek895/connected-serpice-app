import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser(): Promise<{
  userId?: string;
  email?: string;
  name?: string;
  image?: string | null;
}> {
  const session = await getServerSession(authOptions);
  let userId = session?.user?.id;
  let email = session?.user?.email;
  let name = session?.user?.name;
  let image = session?.user?.image;

  if (!userId && email) {
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (dbUser) {
      userId = dbUser.id;
    }
  }

  return {
    userId: userId || undefined,
    email: email || undefined,
    name: name || undefined,
    image: image || null,
  };
}
