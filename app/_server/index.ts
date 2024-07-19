import { publicProcedure, protectedProcedure, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  getTodos: publicProcedure.query(async () => {
    return [10, 20, 34];
  }),
  getSecretTodos: protectedProcedure.query(() => {
    return ["Secret", "todo", "list"];
  })
});

export type AppRouter = typeof appRouter;
