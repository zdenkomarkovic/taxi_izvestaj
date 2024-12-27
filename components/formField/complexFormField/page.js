import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

const ComplexFormField = ({
  title,
  items,
  total,
  newItem,
  setNewItem,
  addItem,
  valueKey = "value", // Podrazumevani ključ za vrednost
  descriptionKey = "description", // Podrazumevani ključ za opis
  placeholders = { value: "Iznos", description: "Opis" },
}) => {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="">
        {title} - Ukupno: {total} RSD
      </h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={placeholders.value}
            value={newItem[valueKey]}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, [valueKey]: e.target.value }))
            }
          />
          <Input
            type="text"
            placeholder={placeholders.description}
            value={newItem[descriptionKey]}
            onChange={(e) =>
              setNewItem((prev) => ({
                ...prev,
                [descriptionKey]: e.target.value,
              }))
            }
          />
          <Button type="button" onClick={addItem}>
            Dodaj
          </Button>
        </div>
      </div>
      <ul className="mt-3">
        {items.map((item, index) => (
          <li key={index} className="text-gray-700">
            {index + 1}. {item[descriptionKey]} - {item[valueKey]} RSD
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ComplexFormField;
