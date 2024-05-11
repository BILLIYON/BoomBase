import type { Datum, Post, Prisma } from "@prisma/client";
import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import { api } from "~/trpc/react";
import { useStore } from "./store";
import type { WithId } from "~/types/common.types";
import { TrashIcon } from "lucide-react";
import { AddNewPostDialog } from "~/components/ui/dialog";

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
    footer: function Footer(info) {
      const utils = api.useUtils();
      const setSelectedTagId = useStore((state) => state.setSelectedTagId);
      const { mutate: addNewDatum } = api.statistictDatum.addNew.useMutation({
        onSettled: async () => {
          await utils.statistictDatum.invalidate();
        },
      });
      return (
        <Button
          size={"sm"}
          onClick={() => {
            setSelectedTagId("");
            addNewDatum({ dateTime: new Date().toISOString() });
          }}
        >
          Add New
        </Button>
      );
    },
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
    footer: function Footer() {
      const { data: tags } = api.tag.getAll.useQuery(undefined, {
        staleTime: 1000 * 60 * 5,
      });

      const utils = api.useUtils();

      const { mutate: addTagToDatum } =
        api.statistictDatum.addTagToDatum.useMutation({
          onSettled: async () => {
            await utils.tag.getByDatumId.invalidate();
          },
        });

      const selectedDatumId = useStore((state) => state.selectedDatumId);

      return (
        <Combobox
          value=""
          onSetValue={(value) => {
            if (!selectedDatumId) return;
            addTagToDatum({ tagId: value.id, datumId: selectedDatumId });
          }}
          items={
            tags?.map((tag, i) => ({
              label: tag.name,
              value: tag.name,
              id: tag.id,
            })) ?? []
          }
        />
      );
    },
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
    cell: (row) => row.getValue(),
  }),
  postColumnHelper.accessor("mediaIcon", {
    id: "mediaIcon",
    header: "Media Icon",
    cell: (row) => row.getValue(),
  }),
  postColumnHelper.accessor("URL", {
    id: "URL",
    header: "URL",
    cell: (row) => row.getValue(),
  }),
  postColumnHelper.accessor("thumbnailURL", {
    id: "thumbnailURL",
    header: "Thumbnail URL",
    cell: (row) => row.getValue(),
  }),
];

export { postsColumns, statisticsDatumsColumns, tagsColumns };
