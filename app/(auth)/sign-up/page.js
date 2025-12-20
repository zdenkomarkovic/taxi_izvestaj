import React from "react";
import Link from "next/link";

const SignUp = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg text-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Registracija nije dostupna
          </h2>
          <p className="mt-4 text-gray-600">
            Naloge mogu kreirati samo administratori sistema.
          </p>
          <p className="mt-2 text-gray-600">
            Ako vam je potreban nalog, kontaktirajte administratora.
          </p>
        </div>
        <div className="mt-6">
          <Link
            href="/sign-in"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Vrati se na prijavu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
