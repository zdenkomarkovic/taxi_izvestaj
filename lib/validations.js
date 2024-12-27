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
  kmTax: z.coerce.number().optional(),
  kmGaz: z.coerce.number().optional(),
  iznos: z.coerce.number(),
  plin: z.coerce.number().optional(),
  benzin: z.coerce.number().optional(),
  // pranje: z.coerce.number().optional(),
  // pogresanStart: z.coerce.number().optional(),
  // kartica: z.array(z.coerce.number()).optional(),
  // troskovi: z
  //   .array(z.object({ iznosTroska: z.coerce.number(), opis: z.string() }))
  //   .optional(),
  // umanjenje: z
  //   .array(z.object({ iznosUmanjenja: z.coerce.number(), opis: z.string() }))
  //   .optional(),
});
