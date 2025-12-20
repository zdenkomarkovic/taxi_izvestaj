"use client";

import Link from "next/link";
import React from "react";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <div className="border-b-2 shadow-lg fixed left-0 right-0 top-0 z-50 bg-white">
      <div className="container mx-auto px-5 py-3 flex items-center justify-between">
        <div className="flex gap-5 uppercase">
          <Link href={"/"} className="hover:text-blue-600 transition">
            Upis
          </Link>
          <Link href={"pregled"} className="hover:text-blue-600 transition">
            Pregled
          </Link>
          <Link href={"endshift"} className="hover:text-blue-600 transition">
            Kraj smene
          </Link>
          {session?.user?.role === "admin" && (
            <Link href={"admin"} className="hover:text-blue-600 transition">
              Admin
            </Link>
          )}
          <Link href={"change-password"} className="hover:text-blue-600 transition text-xs">
            Promeni lozinku
          </Link>
        </div>

        {session && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-700">
              Prijavljen: <strong>{session.user?.name}</strong>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="rounded-md bg-red-600 px-4 py-1 text-white hover:bg-red-700 transition"
            >
              Odjavi se
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
