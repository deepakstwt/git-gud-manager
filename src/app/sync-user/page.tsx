import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "@/server/db";
import React from 'react'

const SyncUser = async () => {
  // Get the Clerk userId from session
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }

  // Fetch user details from Clerk
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if (!user.emailAddresses[0]?.emailAddress) {
    return notFound() 
  }

  // Sync Clerk user with Prisma DB
  await db.user.upsert({
    where: { emailAddress:user.emailAddresses[0]?.emailAddress?? ""
    },
    update: {
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    create: {
      id: userId,
      emailAddress: user.emailAddresses[0]?.emailAddress?? "",
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  // Redirect after syncing
  return redirect("/dashboard");
};

export default SyncUser;
