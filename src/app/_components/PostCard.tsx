import { Post as DBPost } from "@prisma/client";
import { VariantProps, cva } from "class-variance-authority";
import { Gauge } from "lucide-react";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { ConditionalWrapper } from "./ConditionalWrapper";
import Link from "next/link";

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
    VariantProps<typeof postCardVariants>,
    DBPost {}

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
      <Image src={logoURL} alt={name} width={50} height={0} />
      <span>{name}</span>
    </div>
  );
}

function PostCard({
  id,
  variant,
  className,
  thumbnailURL,
  title,
  text,
  postUserLogoURL,
  postUsername,
  prevEngagements,
  currEngagements,
}: PostCardProps) {
  const content = (
    <div className={cn(postCardVariants({ variant }), className)}>
      <Image src={thumbnailURL} alt={title} width={200} height={0} />
      <h2>{title}</h2>
      <PostUsername
        logoURL={postUserLogoURL}
        name={postUsername}
        variant={variant}
      />
      {variant === "large" ? <p>{text}</p> : null}
      <div className=" flex items-center gap-2">
        <Gauge size={variant === "large" ? 15 : 10} />
        <span>{currEngagements - prevEngagements} eng/hr</span>
      </div>
    </div>
  );
  return (
    <>
      {variant === "small" ? (
        <Link href={`/posts/${id}`}>{content}</Link>
      ) : (
        content
      )}
    </>
  );
}

export { PostUsername, PostCard };
