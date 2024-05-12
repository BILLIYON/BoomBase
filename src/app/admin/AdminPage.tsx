"use client";

import { RowSelectionState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { SignOutButton } from "../_components/SignInButton";
import { DataTable } from "./Table";
import {
  allTagsColumns,
  categoriesColumns,
  postsColumns,
  statisticsDatumsColumns,
  tagsColumns,
} from "./TableColumns";
import { useStore } from "./store";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";

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
        <AllTags />
        <Categories />
      </section>

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

function Categories() {
  const utils = api.useUtils();
  const { data: categories } = api.category.getAll.useQuery();

  const { mutate: createCategory } = api.category.create.useMutation({
    onSettled: async () => {
      await utils.category.getAll.invalidate();
    },
  });

  return (
    <DataTable
      data={categories ?? []}
      columns={categoriesColumns}
      showFooter={true}
      onRowClick={(category) => {
        console.log("category", category);
      }}
    />
  );
}

const tagSchema = z.object({
  name: z.string().min(1),
  category: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
});

function AllTags() {
  const { data: tags } = api.tag.getAll.useQuery();

  const utils = api.useUtils();

  const { data: categories } = api.category.getAll.useQuery();

  const { mutate: createTag } = api.tag.create.useMutation({
    onSettled: async () => {
      await utils.tag.getAll.invalidate();
    },
  });

  const form = useForm<z.infer<typeof tagSchema>>({
    resolver: zodResolver(tagSchema),
  });

  return (
    <div className=" flex flex-col gap-2">
      <DataTable data={tags ?? []} columns={allTagsColumns} showFooter={true} />
      <Form {...form}>
        <form
          className=" flex gap-2"
          onSubmit={form.handleSubmit((tag) => {
            let tagname = tag.name;
            if (!tag.name.startsWith("#")) {
              tagname = `#${tag.name}`;
            }
            createTag({
              name: tagname,
              categoryId: tag.category.id,
            });
          })}
        >
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem className="">
                <FormControl>
                  <Input
                    className=" h-8 w-40"
                    placeholder="shadcn"
                    {...field}
                  />
                </FormControl>
                <FormMessage className=" max-w-32 text-xs" />
              </FormItem>
            )}
          />
          <FormField
            name="category"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Combobox
                    className=" h-8"
                    items={
                      categories?.map((c) => ({
                        id: c.id,
                        label: c.name,
                        value: c.name,
                      })) ?? []
                    }
                    onSetValue={(value) => {
                      value && field.onChange(value);
                    }}
                    value={field.value?.name}
                  />
                </FormControl>
                <FormMessage className=" max-w-32 text-xs" />
              </FormItem>
            )}
          />
          <Button size={"sm"} type="submit">
            Add New
          </Button>
        </form>
      </Form>
    </div>
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
      //@ts-expect-error tanstack types are weird
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
      //@ts-expect-error tanstack types are weird
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
      //@ts-expect-error tanstack types are weird
      columns={postsColumns}
    />
  );
}

export { AdminPage };
