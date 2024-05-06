export const metadata = {
  title: "BoomBase app",
  description: "Aggregating the world's data",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <main className=" flex justify-center px-[200px]">{children}</main>;
}
