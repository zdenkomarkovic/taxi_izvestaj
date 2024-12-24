import UserForm from "@/components/forms/UserForm";
import ListUsers from "@/components/listusers/page";
import React from "react";

const Pregled = () => {
  return (
    <div>
      <UserForm />
      <ListUsers />
    </div>
  );
};

export default Pregled;
