"use client";

import { GetPrivateTodos } from "./_components/GetPrivateTodos";
import { GetTodos } from "./_components/GetTodos";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {

  const session = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        {
          session.status === "authenticated"
            ? (
              <button onClick={() => {
                signOut()
              }}>logout</button>
            ) : (
              <button onClick={() => {
                signIn("cognito")
              }}>Signin with google</button>
            )
        }
        {
          session.status === "authenticated"
            ? (
              <GetPrivateTodos />
            ) : (
              <GetTodos />
            )
        }
      </div>
    </main>
  );
}
