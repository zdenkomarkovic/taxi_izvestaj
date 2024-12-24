"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StopSchema } from "@/lib/validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const StopForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [pogresanStart, setPogresanStart] = useState(150);

  const form = useForm({
    resolver: zodResolver(StopSchema),
    defaultValues: {
      kmSat: "",
      kmTax: "",
      kmGaz: "",
      iznos: "",
      pogresanStart: pogresanStart,
    },
  });

  const onSubmit = async (values) => {
    try {
      //   await CreateStart({
      //     kmSat: values.kmSat,
      //     kmTax: values.kmTax,
      //     kmGaz: values.kmGaz,
      //     iznos: values.iznos,
      //     path: pathname,
      //   });
      router.push("pregled");
    } catch (error) {
      console.log(error);
    }
  };

  const incrementPogresanStart = () => {
    const newPogresanStart = pogresanStart + 150;
    setPogresanStart(newPogresanStart);
    form.setValue("pogresanStart", newPogresanStart);
  };

  return (
    <>
      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex  flex-col gap-5 w-[900px] border p-10 rounded-lg mx-auto"
          >
            <FormField
              control={form.control}
              name="kmSat"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="paragraph-semibold text-dark400_light800 flex ">
                    Kilometraza na satu{" "}
                    <span className="text-primary-500">*</span>
                  </FormLabel>
                  <FormControl className="mt-2">
                    <Input
                      type="number"
                      className="no-focus paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 min-h-[36px] border"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kmTax"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="paragraph-semibold text-dark400_light800 flex ">
                    Kilometraza na taximetru{" "}
                    <span className="text-primary-500">*</span>
                  </FormLabel>
                  <FormControl className="mt-2">
                    <Input
                      type="number"
                      className="no-focus paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 min-h-[36px] border"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kmGaz"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="paragraph-semibold text-dark400_light800 flex">
                    Gazna kilometraza<span className="text-primary-500">*</span>{" "}
                  </FormLabel>
                  <FormControl className="mt-2">
                    <Input
                      type="number"
                      className="no-focus paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 min-h-[36px] border"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="iznos"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="paragraph-semibold text-dark400_light800 flex">
                    Iznos na taximetru
                    <span className="text-primary-500">*</span>
                  </FormLabel>
                  <FormControl className="mt-2">
                    <Input
                      type="number"
                      className="no-focus paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 min-h-[36px] border"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pogresanStart"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="paragraph-semibold text-dark400_light800 flex">
                    Pogrešan start (150)
                    <span className="text-primary-500">*</span>
                  </FormLabel>
                  <FormControl className="mt-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="no-focus paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 min-h-[36px] border"
                        {...field}
                        readOnly // Ovaj input je samo za prikazivanje, neće biti editovan direktno
                      />
                      <Button type="button" onClick={incrementPogresanStart}>
                        Dodaj 150
                      </Button>
                    </div>
                  </FormControl>

                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <Button type="submit" className=" w-fit text-xl px-10">
              Kreni
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};

export default StopForm;
