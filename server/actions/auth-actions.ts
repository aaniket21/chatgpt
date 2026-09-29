"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { signupSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signIn } from "@/server/auth";
import { AuthError } from "next-auth";

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  // Check if signups are disabled
  if (process.env.DISABLE_SIGNUPS === "true") {
    return { error: "New signups are currently disabled." };
  }

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  // Check if user exists
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { error: "An account with this email already exists." };
  }

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    name,
    email,
    hashedPassword,
  });

  // Sign in after signup
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Failed to sign in after registration." };
    }
    throw error;
  }
}

import { logAudit } from "@/lib/audit";

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    // Can't reliably log after signIn in server actions since it may redirect or throw AuthError,
    // but we can try (AuthError is usually thrown for redirects in App Router).
    // Actually in NextAuth v5, successful signIn with redirect: false resolves.
    await logAudit("LOGIN_SUCCESS", { email });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}
