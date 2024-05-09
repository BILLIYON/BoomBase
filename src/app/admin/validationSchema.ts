import * as z from "zod";

const tagTableSchema = z.object({
  tags: z.object({
    tag: z.string().min(1).max(255),
    category: z.string().min(1).max(255),
  }),
});

const postSchema = z.object({
  title: z.string().min(1).max(255),
  text: z.string().min(1),
  tag: z.string().min(1).max(255),
  thumbnailURL: z.string().url(),
  URL: z.string().url(),
  mediaIconURL: z.string().url(),
  prevEngagements: z.number(),
  currEngagements: z.number(),
  postUsername: z.string().min(1).max(255),
  postUserLogoURL: z.string().url(),
});

export type TagTableValType = z.infer<typeof tagTableSchema>;
export type PostValType = z.infer<typeof postSchema>;

export { tagTableSchema, postSchema };
