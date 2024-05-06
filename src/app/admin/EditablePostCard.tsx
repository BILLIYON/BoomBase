"use client";

import type { Prisma } from "@prisma/client";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

export function EditablePostCard({
  post,
}: {
  post: Prisma.PostGetPayload<{
    include: { tag: true };
  }>;
}) {
  const [updatedPost, setUpdatedPost] = useState(post);

  function handlePostChange(name: string, value: string) {
    setUpdatedPost((old) => ({ ...old, [name]: value }));
  }
  return (
    <div className=" flex flex-col gap-2">
      <div className=" flex gap-2">
        <span>Title</span>
        <Input
          name="title"
          value={updatedPost.title}
          onChange={(e) => handlePostChange("title", e.target.value)}
        />
      </div>
      <div className=" flex gap-2">
        <span>Text</span>
        <Textarea
          name="text"
          value={updatedPost.text}
          onChange={(e) => handlePostChange("text", e.target.value)}
        />
      </div>
    </div>
  );
}
