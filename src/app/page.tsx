"use client";
import { api } from "~/trpc/react";
import { PostCard } from "./_components/PostCard";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import { create } from "zustand";
import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { Post } from "@prisma/client";

type SortOrder = "desc" | "asc";
type SortingProps = {
  sortingBy: "tag" | "category" | null;
  sortingOrder: SortOrder;
};

type SortingActions = {
  toggleSortingBy: (sortingBy: "tag" | "category") => void;
};
const useSortingStore = create<SortingProps & SortingActions>((set) => ({
  sortingBy: null,
  sortingOrder: "asc",
  toggleSortingBy: (sortingBy) => {
    set((state) => {
      if (state.sortingBy === sortingBy) {
        return {
          sortingBy,
          sortingOrder: state.sortingOrder === "asc" ? "desc" : "asc",
        };
      }
      return {
        sortingBy,
        sortingOrder: "asc",
      };
    });
  },
}));

export default function Home() {
  // maybe need to group and limit the latest posts
  const { data: latestPosts, isPending } = api.post.getLatestPosts.useQuery();

  const { sortingBy, sortingOrder, toggleSortingBy } = useSortingStore();

  console.log("sortingOrder", sortingOrder);
  console.log("sortingBy", sortingBy);
  /**
   * get this form of groupedBySorting:
   * {
   *   sortedBy: "#trump",  // here name of the tag or category
   *  posts: [post1, post2, post3] // here the posts
   * }
   */
  const groupedBySorting = useMemo(() => {
    if (!latestPosts) {
      return {};
    }

    const grouped = latestPosts.reduce(
      (acc, post) => {
        const key = post[sortingBy!] ?? "undefined";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key]?.push(post as Post & { engagementsPerHour: number });
        return acc;
      },
      {} as Record<string, (Post & { engagementsPerHour: number })[]>,
    );

    return grouped;
  }, [latestPosts, sortingBy]);

  const sortedPosts = useMemo(() => {
    return Object.entries(groupedBySorting)
      .sort((a, b) => {
        if (sortingOrder === "asc") {
          return a[0] > b[0] ? 1 : -1;
        }
        return a[0] < b[0] ? 1 : -1;
      })
      .map(([key, posts]) => {
        return {
          sortedBy: key,
          posts,
        };
      })
      .flat();
  }, [groupedBySorting, sortingOrder]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-5 bg-gray-400 px-5 sm:px-[200px]">
      <section className="flex gap-4 py-4">
        <Button
          className=" rounded-full"
          variant={"ghost"}
          onClick={() => {
            toggleSortingBy("category");
          }}
        >
          {sortingBy === "category" ? (
            <ChevronDown
              size={15}
              className={cn({
                "rotate-180": sortingOrder === "asc",
              })}
            />
          ) : null}
          Order by category
        </Button>
        <Button
          className=" rounded-full"
          variant={"ghost"}
          onClick={() => {
            toggleSortingBy("tag");
          }}
        >
          {sortingBy === "tag" ? (
            <ChevronDown
              size={15}
              className={cn({
                "rotate-180": sortingOrder === "asc",
              })}
            />
          ) : null}
          Order by tag
        </Button>
        <Button
          onClick={() => {
            useSortingStore.setState({ sortingBy: null });
          }}
        >
          Reset grouping
        </Button>
      </section>
      <section className=" flex w-full flex-col gap-4 py-4">
        {isPending && <div>Loading...</div>}
        {sortedPosts?.map(({ sortedBy, posts }, index) => {
          if (sortedBy === "undefined")
            return (
              <div
                key={sortedBy}
                className=" flex flex-wrap justify-center gap-2"
              >
                {posts.map((p) => {
                  return <PostCard key={p.id} variant={"small"} post={p} />;
                })}
              </div>
            );
          return (
            <div
              key={sortedBy}
              className="flex flex-col gap-4 rounded-md bg-slate-200 p-2"
            >
              <h2>{sortedBy}</h2>
              <div className=" flex flex-wrap justify-center gap-2">
                {posts.map((p) => {
                  return <PostCard key={p.id} variant={"small"} post={p} />;
                })}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
