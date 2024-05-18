"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "~/lib/utils";
import { AddNewPostDialogContent } from "~/app/admin/AddNewPostDialogContent";
import { api } from "~/trpc/react";
import { useStore } from "~/app/admin/store";
import { Button } from "./button";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid   translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

function AddNewPostDialog({
  title,
  description,
  trigger,
}: {
  trigger: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  const utils = api.useUtils();

  const { mutate: createNewPost } = api.post.create.useMutation({
    onSettled: async () => {
      setOpen(false);
      await utils.statistictDatum.getAll.invalidate();
      await utils.post.getPostsForTagAndDatum.invalidate({
        tagId: selectedTagId ?? "",
        datumId: selectedDatumId ?? "",
      });
    },
  });

  const { mutate: addExistingPost } =
    api.post.addPostWithNewEngagementForDatum.useMutation({
      onSettled: async () => {
        setOpen(false);
        await utils.statistictDatum.getAll.invalidate();
        await utils.post.getPostsForTagAndDatum.invalidate({
          tagId: selectedTagId ?? "",
          datumId: selectedDatumId ?? "",
        });
      },
    });

  const selectedTagId = useStore((state) => state.selectedTagId);
  const selectedDatumId = useStore((state) => state.selectedDatumId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className=" max-h-screen w-3/4 max-w-screen-sm overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {selectedDatumId && (
          <AddNewPostDialogContent
            onSubmit={(data) => {
              console.log("selectedTagId", selectedTagId);
              if (!selectedTagId) return;
              createNewPost({
                ...data,
                engagementsAmount: Number(data.engagementsAmount),
                tagId: selectedTagId,
                datumId: selectedDatumId,
              });
            }}
            onExistingPostSubmit={(data, postId) => {
              addExistingPost({
                ...data,
                postId,
                engagementsAmount: Number(data.engagementsAmount),
                datumId: selectedDatumId,
              });
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AreYouSureDialog({
  title,
  description,
  trigger,
  okTrigger,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  trigger: React.ReactNode;
  okTrigger: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className=" max-h-screen w-3/4 max-w-screen-sm overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>{okTrigger}</DialogClose>
          <DialogClose asChild>
            <Button variant={"secondary"}>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  AreYouSureDialog,
  AddNewPostDialog,
};
