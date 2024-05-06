import { getServerAuthSession } from "~/server/auth";
import { SignInButton } from "../_components/SignInButton";

import { AdminPage } from "./AdminPage";

export default async function Page() {
  const session = await getServerAuthSession();
  const isAdminLoggedin = session?.user.role === "admin";

  if (!isAdminLoggedin) return <SignInButton />;
  return <AdminPage />;
}
