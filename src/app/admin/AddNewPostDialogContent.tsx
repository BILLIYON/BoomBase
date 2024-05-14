"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { api } from "~/trpc/react";
import { DataTable } from "./Table";
import { useStore } from "./store";
import { createColumnHelper } from "@tanstack/react-table";
import { Post } from "@prisma/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useState } from "react";
import Image from "next/image";

const existingPostsColumnsHelper = createColumnHelper<Post>();
const existingPostsColumns = [
  existingPostsColumnsHelper.accessor("title", {
    header: "Title",
    cell: (row) => <div>{row.getValue()}</div>,
  }),
  existingPostsColumnsHelper.accessor("mediaIcon", {
    header: "Media Icon",
    cell: (row) => <div>{row.getValue()}</div>,
  }),
  existingPostsColumnsHelper.accessor("thumbnailURL", {
    header: "Thumbnail URL",
    cell: (row) => (
      <Image
        src={row.getValue()}
        height={0}
        width={0}
        alt={row.row.original.title}
        className="h-10 w-auto"
      />
    ),
  }),
];

function ExistingPostsForThisTagTable({
  alreadyAddedPostIds,
  onPostSelect,
  selectedRowId,
}: {
  alreadyAddedPostIds: string[];
  onPostSelect?: (postId: string) => void;
  selectedRowId?: string;
}) {
  const selectedTagId = useStore((state) => state.selectedTagId);

  const { data: posts } = api.post.getAllPostsForTag.useQuery({
    tagId: selectedTagId,
  });

  return (
    <DataTable
      className=" text-xs"
      data={posts?.filter((p) => !alreadyAddedPostIds.includes(p.id)) ?? []}
      columns={existingPostsColumns}
      selectedRowId={selectedRowId}
      onRowClick={(post) => {
        onPostSelect?.(post.id);
      }}
    />
  );
}

const postSchema = z.object({
  title: z.string().min(1).max(255),
  text: z.string().min(1),
  thumbnailURL: z.string().url(),
  URL: z.string().url(),
  postUsername: z.string().min(1).max(255),
  postUserLogoURL: z.string().url(),
  mediaIcon: z.string().min(1).max(255),
  engagementsAmount: z.string(),
});

const existingPostSchema = z.object({
  engagementsAmount: z.string(),
});

type PostValType = z.infer<typeof postSchema>;

function AddNewPostDialogContent({
  onSubmit,
  onExistingPostSubmit,
}: {
  onSubmit: (data: PostValType) => void;
  onExistingPostSubmit: (
    data: z.infer<typeof existingPostSchema>,
    postId: string,
  ) => void;
}) {
  const form = useForm<PostValType>({
    resolver: zodResolver(postSchema),
  });

  const existingPostForm = useForm<z.infer<typeof existingPostSchema>>({
    resolver: zodResolver(existingPostSchema),
  });

  const [selectedExistingPostId, setSelectedExistingPostId] =
    useState<string>("");

  const { data: selectedPost } = api.post.getById.useQuery(
    selectedExistingPostId,
    {
      enabled: !!selectedExistingPostId,
    },
  );

  const { data: alreadyAddedPosts } = api.post.getLatestPostsForTag.useQuery({
    tagId: useStore((state) => state.selectedTagId) ?? "",
  });

  const alreadyAddedPostsIds = alreadyAddedPosts?.map((p) => p.id) ?? [];

  return (
    <div className=" flex w-full flex-col gap-4">
      <Button
        size={"sm"}
        variant={"destructive"}
        className=" w-fit self-start"
        onClick={() => {
          setSelectedExistingPostId("");
          existingPostForm.reset({
            engagementsAmount: "",
          });
          form.reset({
            title: "",
            text: "",
            thumbnailURL: "",
            URL: "",
            postUsername: "",
            postUserLogoURL: "",
            mediaIcon: "",
            engagementsAmount: "",
          });
        }}
      >
        Reset
      </Button>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Existing posts</AccordionTrigger>
          <AccordionContent>
            <ExistingPostsForThisTagTable
              alreadyAddedPostIds={alreadyAddedPostsIds}
              selectedRowId={selectedExistingPostId}
              onPostSelect={(postId) => setSelectedExistingPostId(postId)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {selectedPost ? (
        <Form {...existingPostForm}>
          <div className=" flex flex-wrap gap-2">
            <LabelValue label="Title" value={selectedPost.title} />
            <LabelValue label="URL" value={selectedPost.URL} />
            <LabelValue
              label="Post Username"
              value={selectedPost.postUsername}
            />
            <LabelValue
              label="Thumbnail URL"
              value={selectedPost.thumbnailURL}
            />
          </div>

          <form
            className=" flex flex-col justify-center gap-2"
            onSubmit={existingPostForm.handleSubmit((data) =>
              onExistingPostSubmit(data, selectedExistingPostId),
            )}
          >
            <FormField
              name="engagementsAmount"
              control={existingPostForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Engagements amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className=" h-4 w-20"
                      placeholder="Engagements amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className=" flex flex-col justify-center gap-2"
          >
            <div className=" grid grid-cols-2 gap-2">
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="URL"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="postUsername"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post username</FormLabel>
                    <FormControl>
                      <Input placeholder="Post username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="postUserLogoURL"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post User Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Post user logo URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="thumbnailURL"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Thumbnail URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="mediaIcon"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media Icon</FormLabel>
                  <FormDescription>{`Supported icons: "Instagram", "Facebook", "Twitter", "Tiktok". Just enter the name`}</FormDescription>
                  <FormControl>
                    <Input placeholder="Media Icon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="text"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Text of the news" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="engagementsAmount"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Engagements Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className=" w-20"
                      placeholder="Engagements amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      )}
    </div>
  );
}

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div className=" flex flex-wrap gap-2">
      <h2>{label}</h2>
      <div className=" max-w-fit overflow-x-auto text-wrap rounded border border-gray-300 text-xs">
        {value}
      </div>
    </div>
  );
}

export { AddNewPostDialogContent };
