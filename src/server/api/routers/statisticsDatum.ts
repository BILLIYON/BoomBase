import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const statisticsDatumRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const response = await ctx.db.datum.findMany({
      orderBy: {
        dateTime: "desc",
      },
      include: {
        _count: {
          select: {
            tags: true,
            postEngagements: true,
          },
        },
      },
    });

    return response.map((d) => {
      const { _count, ...rest } = d;

      return {
        ...rest,
        postsCount: d._count?.postEngagements || 0,
        tagsCount: d._count?.tags || 0,
      };
    });
  }),

  addNew: protectedProcedure
    .input(z.object({ dateTime: z.string().datetime() }))
    .mutation(({ ctx, input }) =>
      ctx.db.datum.create({ data: { dateTime: input.dateTime } }),
    ),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.datum.delete({ where: { id: input.id } }),
    ),

  setDatumPublishedStatus: protectedProcedure
    .input(
      z.object({
        isPublished: z.boolean(),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.datum.update({
        where: {
          id: input.id,
        },
        data: {
          isPublished: input.isPublished,
        },
      });
    }),

  unpublishDatum: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.datum.update({
        where: {
          id: input,
        },
        data: {
          isPublished: false,
        },
      });
    }),

  addTagToDatum: protectedProcedure
    .input(
      z.object({
        tagId: z.string().min(1),
        datumId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.datum.update({
        where: {
          id: input.datumId,
        },
        data: {
          tags: {
            connect: {
              id: input.tagId,
            },
          },
        },
      });
    }),
  removeTagFromDatum: protectedProcedure
    .input(z.object({ tagId: z.string(), datumId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (transaction) => {
        await transaction.datum.update({
          where: {
            id: input.datumId,
          },
          data: {
            tags: {
              disconnect: {
                id: input.tagId,
              },
            },
          },
        });

        await transaction.postEngagement.deleteMany({
          where: {
            datumId: input.datumId,
            post: {
              tagId: input.tagId,
            },
          },
        });
      });

      return ctx.db.datum.update({
        where: {
          id: input.datumId,
        },
        data: {
          tags: {
            disconnect: {
              id: input.tagId,
            },
          },
        },
      });
    }),

  getTagsByDatumId: protectedProcedure
    .input(z.object({ datumId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const datum = await ctx.db.datum.findUnique({
        where: {
          id: input.datumId,
        },
        include: {
          tags: true,
        },
      });

      return datum?.tags ?? [];
    }),
});
