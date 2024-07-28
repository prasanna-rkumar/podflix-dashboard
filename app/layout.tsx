import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "../trpc/Provider";
import { getServerSession } from "next-auth";
import SessionProvider from "@/auth/SessionProvider";
import Link from "next/link";
import AuthDropdown from "@/components/app/auth/AuthDropdown";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PodFlix",
  description: "Create Audiograms for your Podcast Episodes",
  icons: {
    icon: "/microphone.ico,"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="relative">
        <SessionProvider session={session}>
          <Provider>
            <nav className=" absolute bg-white top-0 left-0 w-full flex justify-between items-center border-b border-slate-200 shadow-md p-4">
              <div>
                <Link className=" flex justify-start items-center gap-2" href="/">
                  <Image width={24} height={24} src={"/microphone.png"} alt="PodFlix" />
                  <span className=" text-xl font-semibold">PodFlix</span>
                </Link>
              </div>
              <AuthDropdown />
            </nav>
            <main
              className="flex h-screen flex-col justify-start items-start pt-20"
            >
              {children}
            </main>
          </Provider>
        </SessionProvider>
      </body>
    </html>
  );
}
