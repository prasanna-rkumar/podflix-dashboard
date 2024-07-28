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
    <div
      className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-4 px-5"
    >
      <div className=" rounded-md flex flex-col justify-center items-start gap-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
          Create Audiograms for your Podcast Episodes
        </h1>
        <h4 className="max-w-[600px] text-slate-600 md:text-xl">AI-powered tool to generate stunning audiograms for your podcast episodes, perfect for sharing on social media</h4>
        <GoogleLoginButton />
      </div>
      <div className=" rounded-md"></div>
      {/* <Card className="w-full max-w-md p-6 space-y-4 border-slate-300">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Welcome to PodFlix App</h1>
          <p className="text-muted-foreground">Sign in to create videos out of your podcast episodes.</p>
        </div>
        
      </Card> */}
    </div>
  );
}
