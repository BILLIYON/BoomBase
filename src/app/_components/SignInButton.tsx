"use client";
import { signIn, signOut } from "next-auth/react";

export function SignInButton() {
  return (
    <button onClick={() => signIn("discord")}>Sign in with Discord</button>
  );
}

export function SignOutButton() {
  return <button onClick={() => signOut()}>Sign Out</button>;
}
