import { useState } from "react";

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [newItem, setNewItem] = useState({ iznos: "", opis: "" });

  const addItem = () => {
    const { value, description } = newItem;

    if (!value || isNaN(value) || !description.trim()) return;

    const parsedValue = parseFloat(value);
    setItems((prev) => [...prev, { value: parsedValue, description }]);
    setTotal((prevTotal) => prevTotal + parsedValue);
    setNewItem({ iznos: "", opis: "" });
  };

  return {
    items,
    total,
    newItem,
    setNewItem,
    addItem,
  };
};
