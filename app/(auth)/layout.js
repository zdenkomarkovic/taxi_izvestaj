import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

const AuthLayout = async ({ children }) => {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-auth bg-cover bg-center bg-no-repeat px-4 py-10 ">
      {children}
    </main>
  );
};

export default AuthLayout;
