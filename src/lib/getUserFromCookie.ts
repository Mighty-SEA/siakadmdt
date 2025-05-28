"use server";

import { cookies } from "next/headers";

type User = {
  id: number;
  name: string;
  email: string;
  role?: {
    id: number;
    name: string;
  };
};

export async function getUserFromCookie(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = await cookieStore.get("user");
    
    if (!userCookie?.value) {
      return null;
    }
    
    const user = JSON.parse(userCookie.value);
    
    if (!user.id) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error getting user from cookie:", error);
    return null;
  }
} 