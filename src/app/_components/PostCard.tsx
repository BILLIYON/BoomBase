import type { Post as DBPost } from "@prisma/client";
import { type VariantProps, cva } from "class-variance-authority";
import { Gauge } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { SocialMediaIcon } from "./SocialMediaIcon";

const postCardVariants = cva(
  "p-2 relative rounded shadow-sm bg-white hover:shadow-md transition duration-200 ease-in-out",
  {
    variants: {
      variant: {
        base: "",
        small: "p-1",
        large: "p-4 flex flex-col gap-2 w-full",
      },
    },
    defaultVariants: {
      variant: "base",
    },
  },
);

const postUsernameVariants = cva("flex ", {
  variants: {
    variant: {
      small: "text-sm gap-1",
      large: "text-lg gap-2",
      base: "text-base gap-2",
    },
  },
  defaultVariants: {
    variant: "base",
  },
});

interface PostCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "id">,
    VariantProps<typeof postCardVariants> {
  post: DBPost & { engagementsPerHour: number };
}

interface PostUsernameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof postUsernameVariants> {
  logoURL: string;
  name: string;
}

function PostUsername({
  logoURL,
  name,
  className,
  variant,
}: PostUsernameProps) {
  return (
    <div className={cn(postUsernameVariants({ variant }), className)}>
      <Image src={logoURL} alt={name} width={35} height={0} />
      <span>{name}</span>
    </div>
  );
}

function PostCard({ post, variant, className }: PostCardProps) {
  const content = (
    <div className={cn(postCardVariants({ variant }), className)}>
      {variant === "large" ? (
        <div className=" flex flex-col gap-2">
          <section className=" flex flex-col gap-4 md:flex-row">
            <div className=" relative">
              <Image
                src={post.thumbnailURL}
                alt={post.title}
                width={300}
                height={0}
                className=" block min-w-40 md:min-w-[300px] "
              />
              <SocialMediaIcon
                name={post.mediaIcon}
                className="absolute right-2 top-1"
              />
            </div>
            <div>
              <h2>{post.title}</h2>
              <p>{post.text}</p>
              <PostUsername
                logoURL={post.postUserLogoURL}
                name={post.postUsername}
                variant={variant}
              />
              <div className=" flex items-center gap-2">
                <Gauge size={15} />
                {post.engagementsPerHour >= 0 ? (
                  <div className=" flex gap-1">
                    <span>{Math.round(post.engagementsPerHour)}</span>
                    <span>eng/hr</span>
                  </div>
                ) : (
                  "new"
                )}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <>
          <div className=" relative">
            <Image
              src={post.thumbnailURL}
              alt={post.title}
              width={200}
              height={0}
              className=" block flex-1"
            />
            <SocialMediaIcon
              name={post.mediaIcon}
              className="absolute right-2 top-1"
            />
          </div>
          <h2>{post.title}</h2>
          <PostUsername
            logoURL={post.postUserLogoURL}
            name={post.postUsername}
            variant={variant}
          />
          <div className=" flex items-center gap-2">
            <Gauge size={15} />
            {post.engagementsPerHour >= 0 ? (
              <div className=" flex gap-1">
                <span>{Math.round(post.engagementsPerHour)}</span>
                <span>eng/hr</span>
              </div>
            ) : (
              "new"
            )}
          </div>
        </>
      )}
    </div>
  );
  return (
    <>
      {post.URL ? (
        <Link href={post.URL} target="_blank">
          {content}
        </Link>
      ) : (
        <Link href={`/posts/${post.id}`}>{content}</Link>
      )}
    </>
  );
}

export { PostCard, PostUsername };
