import { Prisma, Tag } from "@prisma/client";
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
        mediaIcon: z.union([
          z.literal("instagram"),
          z.literal("twitter"),
          z.literal("youtube"),
          z.literal("tiktok"),
          z.literal("facebook"),
        ]),
        URL: z.string().url(),
        thumbnailURL: z.string().url(),
        tagId: z.string().min(1),
        currEngagements: z.number(),
        prevEngagements: z.number(),
        postUsername: z.string().min(1),
        postUserLogoURL: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.post.create({
        data: {
          ...input,
          tagId: input.tagId,
          createdById: ctx.session.user.id,
        },
      });
    }),
  getLatestPostsGroupedByTag: publicProcedure.query(async ({ ctx }) => {
    const latestTags = await ctx.db.latestTag.findMany({
      include: { tag: true },
    });

    const latestTagIds = latestTags.map((latestTag) => latestTag.tagId);

    const latestPosts = (await ctx.db.latestPost.findMany({})).map(
      (p) => p.postId,
    );

    const posts = await ctx.db.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        tagId: {
          in: latestTagIds,
        },
        id: {
          in: latestPosts,
        },
      },
      include: {
        tag: {
          include: {
            category: true,
          },
        },
      },
    });

    return posts.reduce(
      (acc, post) => {
        const postsWithTag = acc.find((p) => p.tag.name === post.tag.name);
        if (!postsWithTag) {
          acc.push({
            tag: post.tag,
            posts: [post],
          });
        } else {
          postsWithTag.posts.push(post);
        }
        return acc;
      },
      [] as { tag: TagWithCategory; posts: typeof posts }[],
    );
  }),
  getLatestPostsForTag: protectedProcedure
    .input(z.object({ tagId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findUnique({
        where: {
          id: input.tagId,
        },
      });

      if (!tag) {
        throw new Error("Tag not found");
      }

      const posts = await ctx.db.post.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          tagId: tag.id,
        },
      });

      return posts;
    }),
  getById: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    return ctx.db.post.findUnique({
      where: {
        id: input,
      },
    });
  }),
});
