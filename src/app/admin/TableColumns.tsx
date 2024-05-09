import { Tag, type Prisma } from "@prisma/client";
import { createColumnHelper } from "@tanstack/react-table";

export type StatDatumWithPostsAndTags = Prisma.StatisticsDatumGetPayload<{
  include: { posts: true; tags: true };
}>;

const statisticsDatumColumnsHelper =
  createColumnHelper<StatDatumWithPostsAndTags>();

const statisticsDatumsColumns = [
  statisticsDatumColumnsHelper.accessor("datetime", {
    id: "datetime",
    header: "DateTime",
    cell: (row) => row.getValue().toISOString(),
  }),
  statisticsDatumColumnsHelper.accessor("posts", {
    id: "posts",
    header: "Posts",
    cell: (row) => row.getValue().length,
  }),
  statisticsDatumColumnsHelper.accessor("tags", {
    id: "tags",
    header: "Tags",
    cell: (row) => row.getValue().length,
  }),
];

export type TagWithCategory = Prisma.TagGetPayload<{
  include: { category: true };
}>;

const tagTableHelper = createColumnHelper<TagWithCategory>();

const tagsColumns = [
  tagTableHelper.accessor("name", {
    id: "name",
    header: "Name",
    cell: (row) => row.getValue(),
  }),
  tagTableHelper.accessor("category.name", {
    id: "category",
    header: "Category",
    cell: (row) => row.getValue(),
  }),
];

export { statisticsDatumsColumns, tagsColumns };
