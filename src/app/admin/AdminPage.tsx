"use client";

import { RowSelectionState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { SignOutButton } from "../_components/SignInButton";
import { DataTable } from "./Table";
import {
  postsColumns,
  statisticsDatumsColumns,
  tagsColumns,
} from "./TableColumns";
import { useStore } from "./store";

function AdminPage() {
  const utils = api.useUtils();
  const [newTagName, setNewTagName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >("");
  const [newCategory, setNewCategory] = useState("");

  const { data: tags, isPending } = api.tag.getAll.useQuery();

  const { mutate: createTag } = api.tag.create.useMutation({
    onSettled: async () => {
      await utils.tag.getAll.invalidate();
    },
  });

  const { mutate: createCategory } = api.category.create.useMutation({
    onSettled: async () => {
      await utils.category.getAll.invalidate();
    },
  });

  const { data: categories } = api.category.getAll.useQuery();

  const setDelectedDatumId = useStore((state) => state.setSelectedDatumId);
  const setSelectedTagId = useStore((state) => state.setSelectedTagId);
  const selectedDatumId = useStore((state) => state.selectedDatumId);
  const selectedTagId = useStore((state) => state.selectedTagId);

  console.log("categories", categories);

  return (
    <main>
      <SignOutButton />

      <h1>Admin Page</h1>

      <section className=" flex gap-4 ">
        <DatumsTable />
        <TagList />
      </section>
      {selectedTagId ? <LatestPostList /> : null}

      {/* <LatestTagsTable />
      <TagList />
      <CategoryList /> */}
    </main>
  );
}

function DatumsTable() {
  const { data: datums } = api.statistictDatum.getAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const setSelectedDatumId = useStore((state) => state.setSelectedDatumId);
  const selectedDatumId = useStore((state) => state.selectedDatumId);

  return (
    <DataTable
      data={datums ?? []}
      selectedRowId={selectedDatumId ?? ""}
      columns={statisticsDatumsColumns}
      showFooter={true}
      onRowClick={(datum) => {
        setSelectedDatumId(datum.id);
      }}
    />
  );
}

function TagList() {
  const selectedDatumId = useStore((state) => state.selectedDatumId);
  const setSelectedTagId = useStore((state) => state.setSelectedTagId);
  const selectedTagId = useStore((state) => state.selectedTagId);

  const { data: tags, isPending } = api.tag.getByDatumId.useQuery(
    { datumId: selectedDatumId ?? "" },
    { enabled: !!selectedDatumId },
  );

  useEffect(() => {
    if ((!tags || tags.length === 0) && !isPending) {
      setSelectedTagId("");
    }
  }, [tags, isPending, setSelectedTagId]);

  return (
    <DataTable
      columns={tagsColumns}
      data={tags ?? []}
      selectedRowId={selectedTagId ?? ""}
      showFooter={true}
      onRowClick={(tag) => {
        setSelectedTagId(tag.id);
      }}
    />
  );
}

function LatestPostList() {
  const selectedTagId = useStore((state) => state.selectedTagId);

  const selectedDatumId = useStore((state) => state.selectedDatumId);

  const { data: postsForTagAndDatum } =
    api.post.getPostsForTagAndDatum.useQuery(
      { tagId: selectedTagId ?? "", datumId: selectedDatumId ?? "" },
      { enabled: !!selectedTagId, staleTime: 1000 * 60 * 5 },
    );

  return (
    <DataTable
      showFooter={true}
      data={postsForTagAndDatum ?? []}
      columns={postsColumns}
    />
  );
}

export { AdminPage };
