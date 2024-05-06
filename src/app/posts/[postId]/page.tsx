import { PostCard } from "~/app/_components/PostCard";
import { api } from "~/trpc/server";

export default async function Page({ params }: { params: { postId: string } }) {
  const post = await api.post.getById(Number(params.postId));

  console.log("POST ID", params.postId);

  return (
    <>
      {post ? (
        <PostCard variant={"large"} {...post} />
      ) : (
        <div>Post not found</div>
      )}
    </>
  );
}
