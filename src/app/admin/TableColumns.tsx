import { zodResolver } from "@hookform/resolvers/zod";
import type { Category, Datum, Post } from "@prisma/client";
import { createColumnHelper } from "@tanstack/react-table";
import { LinkIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import { AddNewPostDialog } from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import type { WithId } from "~/types/common.types";
import { useStore } from "./store";

export type StatDatumWithPostsAndTags = Datum & {
  postsCount: number;
  tagsCount: number;
};

const statisticsDatumColumnsHelper =
  createColumnHelper<StatDatumWithPostsAndTags>();

const statisticsDatumsColumns = [
  statisticsDatumColumnsHelper.accessor("dateTime", {
    id: "datetime",
    header: "DateTime",
    cell: (row) => row.getValue().toISOString(),
  }),
  statisticsDatumColumnsHelper.accessor("postsCount", {
    id: "posts",
    header: "Posts",
    cell: (row) => row.getValue(),
  }),
  statisticsDatumColumnsHelper.accessor("tagsCount", {
    id: "tags",
    header: "Tags",
    cell: (row) => row.getValue(),
  }),
];

export type TagWithCategory = WithId<{ name: string; category: string }>;

const tagTableHelper = createColumnHelper<TagWithCategory>();

const tagsColumns = [
  tagTableHelper.accessor("name", {
    id: "name",
    header: "Name",
    cell: (row) => row.getValue(),
  }),
  tagTableHelper.accessor("category", {
    id: "category",
    header: "Category",
    cell: (row) => row.getValue(),
  }),
  tagTableHelper.display({
    id: "actions",
    header: "Actions",
    cell: function Cell(ctx) {
      const selectedDatumId = useStore((state) => state.selectedDatumId);
      const utils = api.useUtils();

      const { mutate: removeTagFromDatum } =
        api.statistictDatum.removeTagFromDatum.useMutation({
          onSettled: async () => {
            await utils.tag.getByDatumId.invalidate({
              datumId: selectedDatumId ?? "",
            });
            await utils.statistictDatum.getAll.invalidate();
          },
        });

      return (
        <Button
          variant={"ghost"}
          onClick={() => {
            if (!selectedDatumId) return;
            removeTagFromDatum({
              datumId: selectedDatumId,
              tagId: ctx.row.original.id,
            });
          }}
        >
          {" "}
          <TrashIcon size={15} />
        </Button>
      );
    },
  }),
];

const allTagsColumns = [
  tagTableHelper.accessor("name", {
    id: "name",
    header: "Name",
    cell: (row) => row.getValue(),
  }),
  tagTableHelper.accessor("category", {
    id: "category",
    header: "Category",
    cell: (row) => row.getValue(),
  }),
];

export type TablePost = Post;

const postColumnHelper = createColumnHelper<TablePost>();

const postsColumns = [
  postColumnHelper.accessor("title", {
    id: "title",
    header: "Title",
    cell: (row) => row.getValue(),
    footer: function Footer() {
      return (
        <AddNewPostDialog
          trigger={<Button size={"sm"}>Add New</Button>}
          title={"Add New Post"}
          description={"Add a new post or reuse existing post"}
        />
      );
    },
  }),
  postColumnHelper.accessor("text", {
    id: "text",
    header: "Text",
    cell: (row) =>
      row.getValue().length > 50
        ? row.getValue().slice(0, 50) + "..."
        : row.getValue(),
  }),
  postColumnHelper.accessor("mediaIcon", {
    id: "mediaIcon",
    header: "Media Icon",
    cell: (row) => row.getValue(),
  }),
  postColumnHelper.accessor("URL", {
    id: "URL",
    header: "URL",
    cell: (row) => (
      <Link className=" text-balance" href={row.getValue()}>
        <LinkIcon />
      </Link>
    ),
  }),
  postColumnHelper.accessor("thumbnailURL", {
    id: "thumbnailURL",
    header: "Thumbnail URL",
    cell: (row) => (
      <Image
        src={row.getValue()}
        height={100}
        width={100}
        alt={row.row.original.title}
        className=" max-h-20"
      />
    ),
  }),
  postColumnHelper.display({
    id: "actions",
    header: "Actions",
    cell: function Cell(ctx) {
      const utils = api.useUtils();

      const { mutate: deletePost } =
        api.post.deletePostWithEngagementForDatum.useMutation({
          onSettled: async () => {
            await utils.post.getPostsForTagAndDatum.invalidate();
            await utils.statistictDatum.getAll.invalidate();
          },
        });

      const selectedDatumId = useStore((state) => state.selectedDatumId);

      return (
        <Button
          variant={"ghost"}
          onClick={() => {
            if (!selectedDatumId) return;
            deletePost({
              datumId: selectedDatumId,
              postId: ctx.row.original.id,
            });
          }}
        >
          <TrashIcon size={15} />
        </Button>
      );
    },
  }),
];

const categoriesColumnsHelper = createColumnHelper<Category>();

export const categorySchema = z.object({
  name: z.string().min(1).max(255),
});

const categoriesColumns = [
  categoriesColumnsHelper.accessor("name", {
    id: "name",
    header: "Name",
    cell: (row) => row.getValue(),
  }),
];

export {
  allTagsColumns,
  categoriesColumns,
  postsColumns,
  statisticsDatumsColumns,
  tagsColumns,
};
