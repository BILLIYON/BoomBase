"use client";

import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { SignOutButton } from "../_components/SignInButton";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import { Input } from "~/components/ui/input";
import { EditablePostCard } from "./EditablePostCard";

function AdminPage() {
  const utils = api.useUtils();
  const [newTagName, setNewTagName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");

  const { data: tags, isPending } = api.tag.getAll.useQuery();

  const { mutate: createTag } = api.tag.create.useMutation({
    onSettled: async () => {
      await utils.tag.getAll.invalidate();
    },
  });

  const { data: posts } = api.post.getLatestPostsForTag.useQuery(
    {
      tagId: selectedTagId!,
    },
    {
      enabled: !!selectedTagId,
    },
  );

  const { mutate: createCategory } = api.category.create.useMutation({
    onSettled: async () => {
      await utils.category.getAll.invalidate();
    },
  });

  const { data: categories } = api.category.getAll.useQuery();

  useEffect(() => {
    if (tags?.[0]) {
      setSelectedTagId(tags[0].id);
    }
  }, [tags]);

  console.log("categories", categories);

  return (
    <main>
      <SignOutButton />

      <h1>Admin Page</h1>

      <section className=" flex gap-2">
        <div>
          <List
            items={categories ?? []}
            renderItem={(item) => (
              <li
                className={cn({
                  "bg-blue-600 text-white": item.id === selectedCategoryId,
                })}
                onClick={() => {
                  setSelectedCategoryId(item.id);
                }}
                key={item.id}
              >
                {item.name}
              </li>
            )}
          />
          <div>
            <Input
              type="text"
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
              }}
            />

            <Button
              disabled={!newCategory || !selectedCategoryId}
              variant={"default"}
              onClick={() => {
                createCategory({ name: newCategory });
                setNewCategory("");
              }}
            >
              Add Category
            </Button>
          </div>
        </div>

        <div>
          <List
            items={tags ?? []}
            renderItem={(tag) => (
              <li
                key={tag.id}
                onClick={() => {
                  setSelectedTagId(tag.id);
                }}
                className={cn({
                  "bg-blue-600 text-white": tag.id === selectedTagId,
                })}
              >
                {tag.name} - {tag.category.name}
              </li>
            )}
          />
          <div>
            <Input
              value={newTagName}
              type="text"
              className=" min-w-10 rounded border border-gray-300 p-1"
              onChange={(e) => {
                setNewTagName(e.target.value);
              }}
            />
            <Combobox
              items={
                categories?.map((category) => ({
                  label: category.name,
                  value: category.id,
                })) ?? []
              }
              onSetValue={(value) => {
                setSelectedCategoryId(value);
              }}
              value={selectedCategoryId}
            />

            <Button
              variant={"default"}
              disabled={!newTagName || !selectedCategoryId}
              onClick={() => {
                if (!selectedCategoryId) return;

                createTag({
                  name: newTagName,
                  categoryId: selectedCategoryId,
                });

                setNewTagName("");
              }}
            >
              Add tag
            </Button>
          </div>
        </div>

        <ul className=" w-40 overflow-auto border border-gray-300  px-1 py-2">
          {posts?.map((post) => (
            <li key={post.id}>
              <EditablePostCard post={post} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function List<T extends Record<string, unknown>>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T) => JSX.Element;
}) {
  return (
    <ul className=" max-h-[200px] overflow-auto border border-gray-300  px-1 py-2">
      {items.map(renderItem)}
    </ul>
  );
}

export { AdminPage };
