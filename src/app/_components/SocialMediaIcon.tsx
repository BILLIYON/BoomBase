import Image from "next/image";

const socialMediaImageProps: Record<
  "Instagram" | "Twitter" | "Facebook" | "Tiktok",
  {
    src: string;
    width: number;
    height: number;
    alt: string;
  }
> = {
  Instagram: {
    src: "/icons/Instagram.svg",
    width: 20,
    height: 20,
    alt: "Instagram icon",
  },
  Twitter: {
    src: "/icons/X.svg",
    width: 20,
    height: 20,
    alt: "Twitter icon",
  },
  Facebook: {
    src: "/icons/Facebook.svg",
    width: 20,
    height: 20,
    alt: "Facebook icon",
  },
  Tiktok: {
    src: "/icons/TikTok.svg",
    width: 20,
    height: 20,
    alt: "TikTok icon",
  },
} as const;

function SocialMediaIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  if (name in socialMediaImageProps) {
    return (
      <Image
        {...socialMediaImageProps[name as keyof typeof socialMediaImageProps]}
        alt={
          socialMediaImageProps[name as keyof typeof socialMediaImageProps].alt
        }
        className={className}
      />
    );
  } else {
    return <span className={className}>{name}</span>;
  }
}

export { SocialMediaIcon };
