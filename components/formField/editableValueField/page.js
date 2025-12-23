import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Pencil, Check, X } from "lucide-react";

const EditableValueField = ({ name, label, control, defaultValue }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [originalValue, setOriginalValue] = useState(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Postavi defaultValue ako field.value nije postavljen
        useEffect(() => {
          if (
            defaultValue !== undefined &&
            defaultValue !== null &&
            (field.value === "" ||
              field.value === undefined ||
              field.value === null)
          ) {
            field.onChange(defaultValue);
          }
        }, [defaultValue]);

        // Ako field.value nije postavljen, koristi defaultValue
        const displayValue =
          field.value !== "" &&
          field.value !== undefined &&
          field.value !== null
            ? field.value
            : defaultValue || "0";

        return (
          <FormItem className="flex w-full flex-col">
            <FormControl className="">
              {!isEditing ? (
                <div className="flex items-center gap-2">
                  <div className="no-focus paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 min-h-[36px] border rounded-md px-3  flex items-center bg-gray-50 min-w-[120px]">
                    <span className="font-bold text-lg">{displayValue}</span>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setOriginalValue(field.value || defaultValue);
                      setIsEditing(true);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2"
                    title="Promeni"
                  >
                    <Pencil className="w-5 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="no-focus paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 min-h-[26px] border"
                    {...field}
                    value={field.value || defaultValue || ""}
                    autoFocus
                  />
                  <Button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-green-600 hover:bg-green-700 text-white p-2"
                    title="Potvrdi"
                  >
                    <Check className="w-5 h-5" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      // Vrati originalnu vrednost
                      field.onChange(
                        originalValue !== null
                          ? originalValue
                          : defaultValue || ""
                      );
                      setIsEditing(false);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2"
                    title="Otkaži"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        );
      }}
    />
  );
};

export default EditableValueField;
