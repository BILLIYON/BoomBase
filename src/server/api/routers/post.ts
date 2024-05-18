import { z } from "zod";
import _ from "lodash";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

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
    const lastTwoDatums = await ctx.db.datum.findMany({
      take: 2,
      where: {
        isPublished: true,
      },
      orderBy: {
        dateTime: "desc",
      },
      select: {
        dateTime: true,
        postEngagements: {
          include: {
            post: {
              include: {
                tag: {
                  select: {
                    name: true,
                    category: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const prevPosts =
      lastTwoDatums[1]?.postEngagements?.map((postEngagement) => ({
        ...postEngagement.post,
        engagementsCount: postEngagement.amount,
      })) ?? [];
    const currentPosts =
      lastTwoDatums[0]?.postEngagements?.map((postEngagement) => ({
        ...postEngagement.post,
        engagementsCount: postEngagement.amount,
      })) ?? [];

    const prevTimestamp = lastTwoDatums[1]?.dateTime;
    const currentTimestamp = lastTwoDatums[0]?.dateTime;

    const differenceInTimestampsInHours =
      ((currentTimestamp?.getTime() ?? 0) - (prevTimestamp?.getTime() ?? 0)) /
      1000 /
      60 /
      60;

    const postIdsInPrevAndCurrent = _.intersectionBy(
      prevPosts,
      currentPosts,
      "id",
    ).map((post) => post.id);

    const postsWithEngPerHour = postIdsInPrevAndCurrent.map((postId) => {
      const prevPost = prevPosts.find((post) => post.id === postId);
      const currentPost = currentPosts.find((post) => post.id === postId);
      const engagementsCountDiff =
        (currentPost?.engagementsCount ?? 0) -
        (prevPost?.engagementsCount ?? 0);
      return {
        ...currentPost,
        tag: currentPost?.tag?.name ?? "",
        category: currentPost?.tag.category.name ?? "",
        engagementsPerHour: differenceInTimestampsInHours
          ? engagementsCountDiff / differenceInTimestampsInHours
          : 0,
      };
    });

    const newPosts = _.differenceBy(currentPosts, prevPosts, "id").map(
      (post) => {
        const tagName = post.tag?.name ?? "";
        const categoryName = post.tag?.category?.name ?? "";
        return {
          ...post,
          tag: tagName,
          category: categoryName,
          engagementsPerHour: -1,
        };
      },
    );

    return [...postsWithEngPerHour, ...newPosts];
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

  getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const post = await ctx.db.post.findUnique({
      where: {
        id: input,
      },
      include: {
        postEngagements: {
          orderBy: {
            datum: {
              dateTime: "desc",
            },
          },
          select: {
            amount: true,
            datum: {
              select: {
                dateTime: true,
              },
            },
          },
          take: 2,
        },
      },
    });

    if (!post) throw new TRPCError({ code: "NOT_FOUND" });

    const timeDeltaInHours =
      ((post?.postEngagements[0]?.datum.dateTime.getTime() ?? 0) -
        (post?.postEngagements[1]?.datum.dateTime.getTime() ?? 0)) /
      1000 /
      60 /
      60;

    const engagementsDelta =
      (post?.postEngagements[0]?.amount ?? 0) -
      (post?.postEngagements[1]?.amount ?? 0);

    const { postEngagements, ...postData } = post;

    return {
      ...postData,
      engagementsPerHour: timeDeltaInHours
        ? engagementsDelta / timeDeltaInHours
        : -1,
    };
  }),
});
