import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";

const CustomFormField = ({
  name,
  label,
  placeholder,
  control,
  type = "text",
  readOnly = false,
  onClickButton,
  buttonLabel,
  lastValue = null,
  children,
}) => {
  const [difference, setDifference] = useState(null);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex w-full flex-col">
          <FormLabel className="paragraph-semibold text-dark400_light800 flex items-center gap-0">
            {label}
            {children}
            {lastValue !== null && difference !== null && (
              <p>
                <span className="font-bold">{difference}</span>{" "}
              </p>
            )}
          </FormLabel>
          <FormControl className="mt-2">
            <div className="flex items-center gap-2">
              <Input
                type={type}
                className="no-focus paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 min-h-[36px] border"
                placeholder={placeholder}
                {...field}
                readOnly={readOnly}
                onChange={(e) => {
                  field.onChange(e);
                  if (lastValue !== null) {
                    let diff = Number(e.target.value) - Number(lastValue);
                    // Ako je razlika negativna, znači da je prešlo preko 1,000,000
                    if (diff < 0) {
                      diff = (1000000 - Number(lastValue)) + Number(e.target.value);
                    }
                    setDifference(diff);
                  }
                }}
              />
              {onClickButton && (
                <Button
                  type="button"
                  onClick={onClickButton}
                  className="btn btn-primary"
                >
                  {buttonLabel}
                </Button>
              )}
            </div>
          </FormControl>
          <FormMessage className="text-red-500" />
        </FormItem>
      )}
    />
  );
};
export default CustomFormField;
