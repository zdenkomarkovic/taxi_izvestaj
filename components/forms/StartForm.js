"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StartSchema } from "@/lib/validations";
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
import {
  CreateStart,
  GetLastStart,
  GetStarts,
} from "@/lib/actions/start.action";

const StartForm = () => {
  const [lastStart, setLastStart] = useState(null);

  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(StartSchema),
    defaultValues: {
      kmSat: "",
      kmTax: "",
      kmGaz: "",
      iznos: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await CreateStart({
        kmSat: values.kmSat,
        kmTax: values.kmTax,
        kmGaz: values.kmGaz,
        iznos: values.iznos,
        path: pathname,
      });
      router.push("pregled");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchLastStart = async () => {
      try {
        const data = await GetLastStart();
        setLastStart(data); // Spremaš plain objekat
      } catch (error) {
        console.error("Error fetching last start:", error);
      }
    };

    fetchLastStart();
  }, []);
  return (
    <>
      <div>
        {lastStart && (
          <p className="pl-10">
            -{" "}
            <span className="font-bold">
              {new Date(lastStart.createdAt).toLocaleString()}
            </span>
          </p>
        )}
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
                    Kilometraza na satu.{" "}
                    <span className="text-primary-500">*</span>
                    {lastStart && (
                      <p className="pl-10">
                        zadnje upisano -{" "}
                        <span className="font-bold">{lastStart.kmSat}</span>
                      </p>
                    )}
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
                    {lastStart && (
                      <p className="pl-10">
                        zadnje upisano -{" "}
                        <span className="font-bold">{lastStart.kmTax}</span>
                      </p>
                    )}
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
                    {lastStart && (
                      <p className="pl-10">
                        zadnje upisano -{" "}
                        <span className="font-bold">{lastStart.kmSat}</span>
                      </p>
                    )}
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
                    {lastStart && (
                      <p className="pl-10">
                        zadnje upisano -{" "}
                        <span className="font-bold">{lastStart.kmSat}</span>
                      </p>
                    )}
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

            <Button type="submit" className=" w-fit text-xl px-10">
              Kreni
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};

export default StartForm;
