"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { SignOutButton } from "../_components/SignInButton";
import { DataTable } from "./Table";
import {
  allTagsColumns,
  categoriesColumns,
  categorySchema,
  postsColumns,
  statisticsDatumsColumns,
  tagsColumns,
} from "./TableColumns";
import { useStore } from "./store";
import { cn } from "~/lib/utils";

function AdminPage() {
  const selectedTagId = useStore((state) => state.selectedTagId);

  return (
    <main className=" prose max-w-none px-5 py-2">
      <SignOutButton />
      <h3 className=" text-center text-lg text-slate-700">Admin Page</h3>
      <section className=" flex gap-4 ">
        <TableCard title="List of all tags in the system" className=" flex-1">
          <AllTags />
        </TableCard>
        <TableCard
          title="List of all categories in the system"
          className=" flex-1"
        >
          <Categories />
        </TableCard>
      </section>

      <section className=" mt-3 flex gap-4">
        <TableCard title="Datums" className=" flex-1">
          <DatumsTable />
        </TableCard>
        <TableCard title="Trending tags at the time of selected datum">
          <TagList />
        </TableCard>
      </section>
      {selectedTagId ? <LatestPostList /> : null}
    </main>
  );
}

function Categories() {
  const { data: categories } = api.category.getAll.useQuery();

  const utils = api.useUtils();
  const { mutate: addCategory } = api.category.create.useMutation({
    onSettled: async () => {
      await utils.category.getAll.invalidate();
    },
  });

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
  });

  return (
    <div className="flex flex-col gap-2">
      <DataTable data={categories ?? []} columns={categoriesColumns} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            addCategory(data);
          })}
          className=" flex items-center gap-2"
        >
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
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

const tagSchema = z.object({
  name: z.string().min(1),
  category: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
});

function TableCard({
  children,
  title,
  className,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        " flex flex-col justify-between gap-2 border border-gray-200 p-2",
        className,
      )}
    >
      {title && <h5>{title}</h5>}

      {children}
    </div>
  );
}

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
      <DataTable data={tags ?? []} columns={allTagsColumns} />
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
                    placeholder="Enter tag name"
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
                    itemName="category"
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

  const utils = api.useUtils();
  const setSelectedTagId = useStore((state) => state.setSelectedTagId);
  const { mutateAsync: addNewDatumAsync } =
    api.statistictDatum.addNew.useMutation({
      onSettled: async () => {
        await utils.statistictDatum.invalidate();
      },
    });

  return (
    <>
      <DataTable
        data={datums ?? []}
        selectedRowId={selectedDatumId ?? ""}
        //@ts-expect-error tanstack types are weird
        columns={statisticsDatumsColumns}
        onRowClick={(datum) => {
          setSelectedDatumId(datum.id);
        }}
      />
      <Button
        size={"sm"}
        className=" w-fit"
        onClick={async () => {
          setSelectedTagId("");
          const createdDatum = await addNewDatumAsync({
            dateTime: new Date().toISOString(),
          });
          setSelectedDatumId(createdDatum.id);
        }}
      >
        Add New
      </Button>
    </>
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

  const { data: allTags } = api.tag.getAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const allNotAddedTags = allTags?.filter(
    (tag) => !tags?.find((t) => t.id === tag.id),
  );

  const utils = api.useUtils();

  const { mutate: addTagToDatum } =
    api.statistictDatum.addTagToDatum.useMutation({
      onSettled: async () => {
        await utils.tag.getByDatumId.invalidate();
      },
    });

  return (
    <>
      <DataTable
        //@ts-expect-error tanstack types are weird
        columns={tagsColumns}
        data={tags ?? []}
        selectedRowId={selectedTagId ?? ""}
        onRowClick={(tag) => {
          setSelectedTagId(tag.id);
        }}
      />

      <Combobox
        itemName="tag"
        value=""
        onSetValue={(value) => {
          if (!selectedDatumId) return;
          addTagToDatum({ tagId: value.id, datumId: selectedDatumId });
          setSelectedTagId(value.id);
        }}
        items={
          allNotAddedTags?.map((tag) => ({
            label: tag.name,
            value: tag.name,
            id: tag.id,
          })) ?? []
        }
      />
    </>
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
