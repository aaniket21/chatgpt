import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — LocalMind Chat",
  description: "Sign in to your LocalMind Chat account",
};

export default function LoginPage() {
  return <LoginForm />;
}
