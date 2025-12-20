import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

const ComplexFormField2 = ({
  title,
  item,
  newItem,
  setNewItem,
  addItem,
  removeItem,
  valueKey = "value",
  descriptionKey = "description",
  placeholders = { value: "Iznos", description: "kilometraza" },
}) => {
  const hasValue = item[valueKey] && item[descriptionKey];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <h3 className="">
          {title} - {item[valueKey]} rsd - {item[descriptionKey]}km
        </h3>
        {hasValue && removeItem && (
          <button
            type="button"
            onClick={removeItem}
            className="text-red-600 hover:text-red-800 font-bold text-sm"
            title="Obriši"
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={placeholders.value}
            value={newItem[valueKey]}
            onChange={(e) =>
              setNewItem((prev) => ({
                ...prev,
                [valueKey]: Number(e.target.value),
              }))
            }
          />
          <Input
            type="number"
            placeholder={placeholders.description}
            value={newItem[descriptionKey]}
            onChange={(e) =>
              setNewItem((prev) => ({
                ...prev,
                [descriptionKey]: Number(e.target.value),
              }))
            }
          />
          <Button type="button" onClick={addItem}>
            Dodaj
          </Button>
        </div>
      </div>
      <ul className="mt-3"></ul>
    </div>
  );
};

export default ComplexFormField2;
