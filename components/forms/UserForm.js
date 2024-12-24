"use client";

import { createUser } from "@/lib/actions/user.action";
import { UserSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";

import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const UserForm = () => {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    try {
      await createUser({
        name: values.name,
        password: values.password,
        path: pathname,
      });
    } catch (error) {
      console.log(error);
    } finally {
      form.reset();
    }
  }
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
              name="name"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="paragraph-semibold text-dark400_light800">
                    Ime i prezime <span className="text-primary-500">*</span>
                  </FormLabel>
                  <FormControl className="mt-2">
                    <Input
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
              name="password"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="paragraph-semibold text-dark400_light800">
                    Sifra <span className="text-primary-500">*</span>
                  </FormLabel>
                  <FormControl className="mt-2">
                    <Input
                      type="password"
                      className="no-focus paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 min-h-[36px] border"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="primary-gradient w-fit !text-light-900"
            >
              Kreiraj korisnika
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};

export default UserForm;
