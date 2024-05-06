"use client";

import { useEffect, useState } from "react";
import { SignOutButton } from "../_components/SignInButton";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { set } from "zod";
import { useQueryClient } from "@tanstack/react-query";

function AdminPage() {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const { data: tags, isPending } = api.tag.getAll.useQuery();

  const { mutate } = api.tag.create.useMutation();
  const utils = api.useUtils();

  const [newTagName, setNewTagName] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const [newCategory, setNewCategory] = useState("");

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
      console.log("settled createCategory");
      await utils.category.getAll.invalidate();
    },
  });

  const { data: categories } = api.category.getAll.useQuery();

  useEffect(() => {
    if (tags?.[0]) {
      setSelectedTagId(tags[0].id);
    }
  }, [tags]);

  return (
    <main>
      <SignOutButton />

      <h1>Admin Page</h1>

      <section className=" flex gap-2">
        {/* <ul>
          {categories?.map((category) => (
            <li key={category.id}>{category.name}</li>
          ))}
        </ul> */}
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
            <input
              type="text"
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value);
              }}
            />
            <button
              onClick={() => {
                createCategory({ name: newCategory });
              }}
            >
              Add Category
            </button>
          </div>
        </div>

        <ul className=" max-h-[200px] overflow-auto border border-gray-300  px-1 py-2">
          {tags?.map((tag) => (
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
          ))}
          <li className=" flex justify-between gap-2">
            <input
              value={newTagName}
              type="text"
              className=" min-w-10 rounded border border-gray-300 p-1"
              onChange={(e) => {
                setNewTagName(e.target.value);
              }}
            />

            <button className=" rounded bg-blue-500 p-1 text-white">
              Add Tag
            </button>
          </li>
        </ul>
        <ul className=" max-h-[200px] w-40 overflow-auto border border-gray-300  px-1 py-2">
          {posts?.map((post) => <li key={post.id}>{post.title}</li>)}
        </ul>
      </section>
    </main>
  );
}

function List<T extends Record<string, string | number | Date>>({
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
