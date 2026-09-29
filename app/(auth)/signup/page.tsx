import { SignupForm } from "@/components/auth/signup-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — LocalMind Chat",
  description: "Create a new LocalMind Chat account",
};

export default function SignupPage() {
  return <SignupForm />;
}
