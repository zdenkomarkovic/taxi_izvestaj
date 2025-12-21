import Navbar from "@/components/navbar/page";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }) => {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main>
      <Navbar />
      <div>{children}</div>
    </main>
  );
};

export default Layout;
