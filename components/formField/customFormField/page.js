import { Button } from "@/components/ui/button";
import React from "react";
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
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="flex w-full flex-col">
        <FormLabel className="paragraph-semibold text-dark400_light800 flex">
          {label}{" "}
        </FormLabel>
        <FormControl className="mt-2">
          <div className="flex items-center gap-2">
            <Input
              type={type}
              className="no-focus paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 min-h-[36px] border"
              placeholder={placeholder}
              {...field}
              readOnly={readOnly}
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

export default CustomFormField;
