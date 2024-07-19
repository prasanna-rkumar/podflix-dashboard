import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createTRPCContext } from "@/server/trpc";
import { appRouter } from "@/server";

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
