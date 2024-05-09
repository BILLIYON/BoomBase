import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const statisticsDatumRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) =>
    ctx.db.statisticsDatum.findMany({
      include: { posts: true, tags: true },
    }),
  ),
  addNew: protectedProcedure
    .input(z.object({ datetime: z.string().datetime() }))
    .mutation(({ ctx, input }) =>
      ctx.db.statisticsDatum.create({ data: { datetime: input.datetime } }),
    ),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) =>
      ctx.db.statisticsDatum.delete({ where: { id: input.id } }),
    ),
});
