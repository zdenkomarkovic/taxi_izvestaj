"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StartSchema } from "@/lib/validations";
import { useSession } from "next-auth/react";
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
import { CreateStart } from "@/lib/actions/start.action";
import { GetLastEndShift } from "@/lib/actions/endshift.action";

const StartForm = () => {
  const [lastEndShift, setLastEndShift] = useState(null);
  const { data: session } = useSession();

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
      if (!session?.user?.id) {
        console.error("User ID not found");
        return;
      }

      await CreateStart({
        kmSat: values.kmSat,
        kmTax: values.kmTax,
        kmGaz: values.kmGaz,
        iznos: values.iznos,
        userId: session.user.id,
        path: pathname,
      });
      router.push("endshift");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchLastEndShift = async () => {
      try {
        if (!session?.user?.id) return;

        // Obični korisnici vide samo svoje zapise
        const userId = session.user.role === "admin" ? null : session.user.id;
        const data = await GetLastEndShift(userId);
        setLastEndShift(data);
      } catch (error) {
        console.error("Error fetching lastShift", error);
      }
    };

    if (session) {
      fetchLastEndShift();
    }
  }, [session]);

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
                    Kilometraza na satuu{" "}
                    <span className="text-primary-500">*</span>
                    {lastEndShift ? (
                      <p className="pl-10">
                        zadnje upisano -{" "}
                        <span className="font-bold">{lastEndShift.kmSat}</span>
                      </p>
                    ) : null}
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
                    {lastEndShift ? (
                      <p className="pl-10">
                        zadnje upisano -{" "}
                        <span className="font-bold">{lastEndShift.kmTax}</span>
                      </p>
                    ) : null}
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
                    {lastEndShift ? (
                      <p className="pl-10">
                        zadnje upisano -{" "}
                        <span className="font-bold">{lastEndShift.kmGaz}</span>
                      </p>
                    ) : null}
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
                    {lastEndShift ? (
                      <p className="pl-10">
                        zadnje upisano -{" "}
                        <span className="font-bold">{lastEndShift.iznos}</span>
                      </p>
                    ) : null}
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
