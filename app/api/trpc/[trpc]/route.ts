import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@/app/_server";
import { createTRPCContext } from "@/app/_server/trpc";

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "api/trpc",
    req,
    router: appRouter,
    createContext: () => {
      return createTRPCContext({
        headers: req.headers,
      });
    }
  })
}

export { handler as GET, handler as POST }
