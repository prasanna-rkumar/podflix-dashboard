"use client";

import { Button } from "@/components/ui/button";
import GoogleIcon from "./GoogleIcon";
import { signIn } from "next-auth/react";

export default function GoogleLoginButton() {
  return (
    <Button
      onClick={() => {
        signIn("cognito")
      }}
      variant={"outline"}
      size={"lg"}
      className="w-full max-w-64 flex items-center justify-center gap-6"
    >
      <GoogleIcon />
      Sign in with Google
    </Button>
  )
}