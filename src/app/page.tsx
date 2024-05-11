import { api } from "~/trpc/server";
import { PostCard } from "./_components/PostCard";

export default async function Home() {
  // maybe need to group and limit the latest posts
  const latestPosts = await api.post.getLatestPosts();

  return (
    <main className="flex min-h-screen justify-center bg-gray-400 px-5 sm:px-[200px]">
      <section className=" flex flex-col gap-4 py-4">
        {latestPosts.map((lp) => {
          return <PostCard key={lp.id} variant={"small"} {...lp} />;
          // return (
          //   <div key={lp.tag.id} className=" rounded-md bg-gray-200 p-2">
          //     <div className=" flex justify-between">
          //       <div className=" text-gray-600">{lp.tag.name}</div>
          //       <div className=" text-gray-600">{lp.tag.category.name}</div>
          //     </div>
          //     <div className="flex flex-wrap justify-center gap-4">
          //       {lp.map((post) => {
          //         return <PostCard key={post.id} variant={"small"} {...post} />;
          //       })}
          //     </div>
          //   </div>
          // );
        })}
      </section>
    </main>
  );
}
