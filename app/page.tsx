import { redirect } from "next/navigation";
import { getServerAuthSession } from "./api/auth/[...nextauth]/route";

import { Card } from "@/components/ui/card";
import GoogleLoginButton from "@/components/app/auth/GoogleLoginButton";

export default async function Home() {

  const session = await getServerAuthSession();

  if (session && session.user) {
    redirect("/dashboard");
  }

  return (
    <main style={{
      height: "calc(100vh - 16rem)"
    }} className="flex justify-center items-center">
      <Card className="w-full max-w-md p-6 space-y-4 border-slate-300">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Welcome to PodFlix App</h1>
          <p className="text-muted-foreground">Sign in to create videos out of your podcast episodes.</p>
        </div>
        <GoogleLoginButton />
      </Card>
    </main>
  );
}
