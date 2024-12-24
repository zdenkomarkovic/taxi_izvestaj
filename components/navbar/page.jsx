import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <div className=" border-b-2 shadow-lg">
      <div className="container mx-auto px-5 py-1 flex gap-5">
        <Link href={"/"}>Upis</Link>
        <Link href={"pregled"}>Pregled</Link>
        <Link href={"endshift"}>Kraj smene</Link>
      </div>
    </div>
  );
};

export default Navbar;
