import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

const AddAmountsField = ({ title, value, setValue, items, total, addItem, removeItem }) => {
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
      <ul className="flex flex-wrap gap-2">
        {items.map((amount, index) => (
          <li key={index} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
            <span className="text-gray-700">{amount}</span>
            {removeItem && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-800 font-bold text-sm ml-1"
                title="Obriši"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddAmountsField;
