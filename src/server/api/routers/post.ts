import type { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

type TagWithCategory = Prisma.TagGetPayload<{
  include: { category: true };
}>;

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        text: z.string().min(1),
        mediaIcon: z.string().min(1),
        URL: z.string().url(),
        thumbnailURL: z.string().url(),
        tagId: z.string().min(1),
        datumId: z.string().min(1),
        engagementsAmount: z.number().min(0),
        postUsername: z.string().min(1),
        postUserLogoURL: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      const { datumId, engagementsAmount, ...dataToCreate } = input;
      return ctx.db.post.create({
        data: {
          ...dataToCreate,
          postEngagements: {
            create: {
              amount: engagementsAmount,
              datum: {
                connect: {
                  id: datumId,
                },
              },
            },
          },
          createdById: ctx.session.user.id,
        },
      });
    }),
  getLatestPosts: publicProcedure.query(async ({ ctx }) => {
    const latestPosts = await ctx.db.latestPost.findMany({
      include: {
        post: {
          include: {
            tag: {
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
            category: true,
            postEngagements: {
              select: {
                datum: {
                  select: {
                    dateTime: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return latestPosts.map((latestPost) => ({
      ...latestPost.post,
    }));
  }),

  getLatestPostsForTag: protectedProcedure
    .input(z.object({ tagId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const latestDatumId = await ctx.db.datum.findFirst({
        orderBy: {
          dateTime: "desc",
        },
        select: {
          id: true,
        },
      });

      const latestPosts = await ctx.db.postEngagement.findMany({
        where: {
          datumId: latestDatumId?.id,
          post: {
            tagId: input.tagId,
          },
        },
        select: {
          post: true,
        },
      });

      return latestPosts.map((latestPost) => latestPost.post);
    }),

  getPostsForTagAndDatum: protectedProcedure
    .input(z.object({ tagId: z.string().min(1), datumId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const engagementIds = await ctx.db.postEngagement.findMany({
        where: {
          datumId: input.datumId,
          post: {
            tagId: input.tagId,
          },
        },
        select: {
          id: true,
          post: true,
        },
      });

      const posts = await ctx.db.post.findMany({
        where: {
          tagId: input.tagId,
          postEngagements: {
            some: {
              id: {
                in: engagementIds.map((engagement) => engagement.id),
              },
            },
          },
        },
      });

      return posts;
    }),
  getAllPostsForTag: protectedProcedure
    .input(z.object({ tagId: z.string().nullable() }))
    .query(async ({ ctx, input }) => {
      if (!input.tagId) {
        return [];
      }
      const posts = await ctx.db.tag
        .findUnique({
          where: {
            id: input.tagId,
          },
        })
        .posts();

      return posts;
    }),
  addPostWithNewEngagementForDatum: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        datumId: z.string().min(1),
        engagementsAmount: z.number().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.postEngagement.create({
        data: {
          postId: input.postId,
          datumId: input.datumId,
          amount: input.engagementsAmount,
        },
      });
    }),
  deletePostWithEngagementForDatum: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        datumId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.postEngagement.deleteMany({
        where: {
          postId: input.postId,
          datumId: input.datumId,
        },
      });
    }),
  getAllPostsForTag: protectedProcedure
    .input(z.object({ tagId: z.string().nullable() }))
    .query(async ({ ctx, input }) => {
      if (!input.tagId) {
        return [];
      }
      const posts = await ctx.db.tag
        .findUnique({
          where: {
            id: input.tagId,
          },
        })
        .posts();

      return posts;
    }),
  getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.post.findUnique({
      where: {
        id: input,
      },
    });
  }),
});
