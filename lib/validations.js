import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(5).max(100),
  password: z.coerce.number(),
});

export const StartSchema = z.object({
  kmSat: z.coerce.number(),
  kmTax: z.coerce.number(),
  kmGaz: z.coerce.number(),
  iznos: z.coerce.number(),
});
export const StopSchema = z.object({
  kmSat: z.coerce.number(),
  kmTax: z.coerce.number(),
  kmGaz: z.coerce.number(),
  iznos: z.coerce.number(),
  pogresanStart: z.coerce.number(),
});
