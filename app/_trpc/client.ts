import { createTRPCReact } from "@trpc/react-query";

import { type AppRouter } from "@/app/_server";

export const trpc = createTRPCReact<AppRouter>();