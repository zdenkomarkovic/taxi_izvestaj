import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(5).max(100),
  password: z.coerce.number(),
});

export const StartSchema = z.object({
  kmSat: z.coerce.number().positive("Kilometraža mora biti pozitivan broj."),
  kmTax: z.coerce.number().positive("Kilometraža mora biti pozitivan broj."),
  kmGaz: z.coerce.number().positive("Kilometraža mora biti pozitivan broj."),
  iznos: z.coerce.number().positive("Iznos mora biti pozitivan broj."),
});
export const StopSchema = z.object({
  kmSatPocetna: z.coerce.number().optional(),
  kmSat: z.coerce.number().positive("Kilometraža mora biti pozitivan broj."),
  kmTax: z.coerce.number().positive("Kilometraža mora biti pozitivan broj."),
  kmGaz: z.coerce.number().positive("Kilometraža mora biti pozitivan broj."),
  iznos: z.coerce.number().positive("Iznos mora biti pozitivan broj."),
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
