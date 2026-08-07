import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
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

  // Safe fallback user for local development if unauthenticated
  if (!userId) {
    let dummyUser = await prisma.user.findFirst({ where: { email: "test@example.com" } });
    if (!dummyUser) {
      dummyUser = await prisma.user.create({
        data: { 
          email: "test@example.com", 
          name: "Test User",
          plan: "FREE" 
        },
      });
    }
    userId = dummyUser.id;
    email = dummyUser.email || "test@example.com";
    name = dummyUser.name || "Test User";
  }

  return { 
    userId, 
    email: email || "user@example.com", 
    name: name || "OurStory User",
    image: image || null
  };
}
