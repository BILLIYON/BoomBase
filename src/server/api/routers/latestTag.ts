import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const latestTagRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.latestTag.findMany({
      include: {
        tag: true,
      },
    });
  }),
  add: protectedProcedure
    .input(
      z.object({
        tagId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.latestTag.create({
        data: {
          tagId: input.tagId,
        },
      });
    }),
  remove: protectedProcedure
    .input(
      z.object({
        tagIds: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.latestTag.deleteMany({
        where: {
          tagId: {
            in: input.tagIds,
          },
        },
      });
    }),
});
