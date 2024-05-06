import { api } from "~/trpc/server";
import { PostCard } from "./_components/PostCard";

export default async function Home() {
  const latestPosts = await api.post.getLatestPostsGroupedByTag();

  return (
    <main className="flex min-h-screen justify-center bg-gray-400 px-5 sm:px-[200px]">
      <section className=" flex flex-col gap-4 py-4">
        {latestPosts.map((lp) => {
          return (
            <div key={lp.tag.id} className=" rounded-md bg-gray-200 p-2">
              <div className=" flex justify-between">
                <div className=" text-gray-600">{lp.tag.name}</div>
                <div className=" text-gray-600">{lp.tag.category.name}</div>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {lp.posts.map((post) => {
                  return <PostCard key={post.id} variant={"small"} {...post} />;
                })}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

// function PostCard({
//   id,
//   title,
//   text,
//   thumbnailUrl,
//   // tag,
//   username,
//   userLogoUrl,
//   currEngagements,
//   prevEngagements,
//   // mediaIcon,
//   // url,
// }: {
//   id: number;
//   title: string;
//   text: string;
//   thumbnailUrl: string;
//   // tag: string;
//   username: string;
//   userLogoUrl: string;
//   currEngagements: number;
//   prevEngagements: number;
//   // mediaIcon: string;
//   // url: string;
// }) {
//   return (
//     <article className=" rounded p-2 shadow-sm">
//       <Link href={`/post/${id}`}>
//         <h2>{title}</h2>

//         <Image src={thumbnailUrl} alt={title} width={200} height={0} />
//       </Link>

//       <p>{text}</p>

//       <div className=" flex gap-2">
//         <Image src={userLogoUrl} alt={username} width={50} height={50} />
//         <p>{username}</p>
//       </div>

//       <div className=" flex gap-2 ">
//         <Gauge size={15} />
//         <span>{currEngagements - prevEngagements}</span>
//         eng/hr
//       </div>
//     </article>
//   );
// }

// // async function CrudShowcase() {
// //   const session = await getServerAuthSession();
// //   if (!session?.user) return null;

// //   const latestPost = await api.post();

// //   return (
// //     <div className="w-full max-w-xs">
// //       {latestPost ? (
// //         <p className="truncate">Your most recent post: {latestPost.title}</p>
// //       ) : (
// //         <p>You have no posts yet.</p>
// //       )}

// //       <CreatePost />
// //     </div>
// //   );
// // }
