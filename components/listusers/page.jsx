import { getUsers } from "@/lib/actions/user.action";
import React from "react";

const ListUsers = async () => {
  let result = await getUsers();

  return (
    <div>
      {result.map((user, i) => {
        return (
          <div key={i} className="w-[300px] border-2">
            <p>{user.name}</p>
            <p>{user.password}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ListUsers;
