import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

const AddAmountsField = ({ title, value, setValue, items, total, addItem }) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="">
        {title} - Ukupno: {total} RSD
      </h3>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Unesite iznos"
        />
        <Button type="button" onClick={addItem}>
          Dodaj
        </Button>
      </div>
      <ul className="h-5 flex flex-wrap">
        {items.map((amount, index) => (
          <li key={index} className="text-gray-700">
            {amount} /
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddAmountsField;
