import React from "react";
const AuthLayout = ({ children }) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-auth bg-cover bg-center bg-no-repeat px-4 py-10 ">
      {children}
    </main>
  );
};

export default AuthLayout;
