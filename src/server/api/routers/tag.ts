import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const tagRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        categoryId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.create({
        data: {
          name: input.name,
          categoryId: input.categoryId,
        },
      });
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.tag.findMany({
      include: { category: true },
    });
  }),
  getByDatumId: protectedProcedure
    .input(z.object({ datumId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const datum = await ctx.db.datum.findUnique({
        where: {
          id: input.datumId,
        },
        include: {
          tags: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return (
        datum?.tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          category: tag.category.name,
        })) ?? []
      );
    }),
});
