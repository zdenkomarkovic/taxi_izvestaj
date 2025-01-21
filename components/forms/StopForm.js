"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { CreateEndshift } from "@/lib/actions/endshift.action";
import CustomFormField from "../formField/customFormField/page";
import AddAmountsField from "../formField/addAmountsField/page";
import ComplexFormField from "../formField/complexFormField/page";
import { GetLastStart } from "@/lib/actions/start.action";

const StopForm = ({ data }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [pogresanStart, setPogresanStart] = useState(0);
  const [pranje, setPranje] = useState(0);
  const [naplataKarticom, setNaplataKarticom] = useState("");
  const [ukupnoKarticom, setUkupnoKarticom] = useState(0);
  const [kartica, setKartica] = useState([]);

  const [troskovi, setTroskovi] = useState([]);
  const [ukupnoTroskovi, setUkupnoTroskovi] = useState(0);
  const [noviTrosak, setNoviTrosak] = useState({ iznosTroska: "", opis: "" });

  const [umanjenje, setUmanjenje] = useState([]);
  const [ukupnoUmanjenje, setUkupnoUmanjenje] = useState(0);
  const [novoUmanjenje, setNovoUmanjenje] = useState({
    iznosUmanjenja: "",
    opis: "",
  });
  const [lastStart, setLastStart] = useState(null);

  useEffect(() => {
    const fetchLastStart = async () => {
      try {
        const data = await GetLastStart();
        console.log("Last start data:", data); // Provera podataka
        setLastStart(data);
        if (data && data.kmSat) {
          form.reset({
            ...form.getValues(),
            kmSatPocetna: data.kmSat,
          });
        }
      } catch (error) {
        console.error("Error fetching last start:", error);
      }
    };

    fetchLastStart();
  }, []);

  const form = useForm({
    resolver: zodResolver(StopSchema),
    defaultValues: {
      kmSatPocetna: "",
      kmSat: "",
      kmTax: "",
      kmGaz: "",
      iznos: "",
      plin: "",
      benzin: "",
      pranje: pranje,
      pogresanStart: pogresanStart,
      kartica: kartica,
      troskovi: troskovi,
      umanjenje: umanjenje,
    },
  });

  const addAmount = () => {
    if (!naplataKarticom || isNaN(naplataKarticom)) return;

    const newAmount = parseFloat(naplataKarticom);

    setKartica((prevAmounts) => [...prevAmounts, newAmount]);
    setUkupnoKarticom((prevTotal) => prevTotal + newAmount);
    setNaplataKarticom("");
  };

  const dodajTrosak = () => {
    const { iznosTroska, opis } = noviTrosak;
    if (!iznosTroska || isNaN(iznosTroska) || !opis.trim()) return;

    const parsedIznos = parseFloat(iznosTroska);
    setTroskovi((prev) => [...prev, { iznosTroska: parsedIznos, opis }]);
    setUkupnoTroskovi((prevTotal) => prevTotal + parsedIznos);
    setNoviTrosak({ iznosTroska: "", opis: "" });
  };

  const dodajUmanjenje = () => {
    const { iznosUmanjenja, opis } = novoUmanjenje;
    if (!iznosUmanjenja || isNaN(iznosUmanjenja) || !opis.trim()) return;

    const parsedUmanjenje = parseFloat(iznosUmanjenja);
    setUmanjenje((prev) => [
      ...prev,
      { iznosUmanjenja: parsedUmanjenje, opis },
    ]);
    setUkupnoUmanjenje((prevTotal) => prevTotal + parsedUmanjenje);
    setNovoUmanjenje({ iznosUmanjenja: "", opis: "" });
  };

  const onSubmit = async (values) => {
    try {
      const kmSatRazlika = lastStart
        ? Number(values.kmSat) - Number(lastStart.kmSat)
        : null;
      const kmTaxRazlika = lastStart
        ? Number(values.kmTax) - Number(lastStart.kmTax)
        : null;
      const kmGazRazlika = lastStart
        ? Number(values.kmGaz) - Number(lastStart.kmGaz)
        : null;
      const iznosRazlika = lastStart
        ? Number(values.iznos) - Number(lastStart.iznos)
        : null;
      const gotovina = lastStart
        ? Number(values.iznos) -
          Number(lastStart.iznos) -
          Number(values.plin) -
          Number(values.benzin)
        : null;
      await CreateEndshift({
        kmSatRazlika: kmSatRazlika,
        kmSatPocetna: lastStart?.kmSat,
        kmSat: values.kmSat,
        kmTaxRazlika: kmTaxRazlika,
        kmTaxPocetna: lastStart?.kmTax,
        kmTax: values.kmTax,
        kmGazRazlika: kmGazRazlika,
        kmGazPocetna: lastStart?.kmGaz,
        kmGaz: values.kmGaz,
        iznosRazlika: iznosRazlika,
        iznosPocetna: lastStart?.iznos,
        iznos: values.iznos,
        gotovina: gotovina,
        plin: values.plin,
        benzin: values.benzin,
        pranje: pranje,
        pogresanStart: pogresanStart,
        kartica: kartica,
        troskovi: troskovi,
        umanjenje: umanjenje,
        path: pathname,
      });
      router.push("pregled");
    } catch (error) {
      console.log(error);
    }
  };

  // const kes =
  //   lastStart && form.watch("iznos")
  //     ? form.watch("iznos") -
  //       lastStart.iznos -
  //       form.watch("plin") -
  //       form.watch("benzin")
  //     : 0;

  const incrementPogresanStart = () => {
    const newPogresanStart = pogresanStart + 150;
    setPogresanStart(newPogresanStart);
    form.setValue("pogresanStart", newPogresanStart);
  };
  const incrementPranje = () => {
    const newPranje = pranje + 100;
    setPranje(newPranje);
    form.setValue("pranje", newPranje);
  };

  return (
    <>
      <div className="z-10 mt-12">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex  flex-col gap-5 w-[900px] border p-10 rounded-lg mx-auto"
          >
            {" "}
            <div className="flex items-center gap-2">
              <CustomFormField
                name="kmSat"
                label="Km na satu"
                control={form.control}
                lastValue={lastStart?.kmSat}
              >
                {lastStart && (
                  <p className="px-5 ">
                    <span className="font-bold px-2">{lastStart.kmSat}</span>
                  </p>
                )}
              </CustomFormField>
              <CustomFormField
                name="kmTax"
                label="Km na Tax."
                control={form.control}
                lastValue={lastStart?.kmTax}
              >
                {lastStart && (
                  <p className="px-5 ">
                    <span className="font-bold px-2">{lastStart.kmTax}</span>
                  </p>
                )}
              </CustomFormField>{" "}
              <CustomFormField
                name="kmGaz"
                label="Gazni km"
                control={form.control}
                lastValue={lastStart?.kmGaz}
              >
                {lastStart && (
                  <p className="px-5 ">
                    <span className="font-bold px-2">{lastStart.kmGaz}</span>
                  </p>
                )}
              </CustomFormField>{" "}
              <CustomFormField
                name="iznos"
                label="Iznos"
                placeholder="Unesite iznos na taximetru"
                control={form.control}
                lastValue={lastStart?.iznos}
              >
                {lastStart && (
                  <p className="px-5 ">
                    <span className="font-bold px-2">{lastStart.iznos}</span>
                  </p>
                )}
              </CustomFormField>{" "}
            </div>
            <div className="grid grid-cols-[0.5fr_0.5fr_1fr_1fr] items-center gap-2">
              <CustomFormField
                name="plin"
                label="Plin"
                control={form.control}
              />{" "}
              <CustomFormField
                name="benzin"
                label="Benzin"
                control={form.control}
              />{" "}
              <CustomFormField
                name="pranje"
                label="Pranje"
                control={form.control}
                readOnly
                onClickButton={incrementPranje}
                buttonLabel="Dodaj 100"
              />
              <AddAmountsField
                title="kartica"
                value={naplataKarticom}
                setValue={setNaplataKarticom}
                items={kartica}
                total={ukupnoKarticom}
                addItem={addAmount}
              />
            </div>
            <div className="flex gap-4">
              <ComplexFormField
                title="Troškovi"
                items={troskovi}
                total={ukupnoTroskovi}
                newItem={noviTrosak}
                setNewItem={setNoviTrosak}
                addItem={dodajTrosak}
                valueKey="iznosTroska"
                descriptionKey="opis"
              />
              <ComplexFormField
                title="Umanjenja"
                items={umanjenje}
                total={ukupnoUmanjenje}
                newItem={novoUmanjenje}
                setNewItem={setNovoUmanjenje}
                addItem={dodajUmanjenje}
                valueKey="iznosUmanjenja"
                descriptionKey="opis"
              />
            </div>
            {lastStart && form.watch("iznos") && (
              <div className="flex flex-col text-lg">
                <p>
                  <strong>odbija se:</strong>{" "}
                  <span>plin - {form.watch("plin")}</span> -{" "}
                  <span>benzin - {form.watch("benzin")} </span> -{" "}
                  <span>pranje - {pranje} </span> -{" "}
                  <span>kartica - {ukupnoKarticom} </span> -{" "}
                  <span>troškovi - {ukupnoTroskovi} </span> -
                  <span>umanjenje - {ukupnoTroskovi} </span> )
                </p>
                <p>
                  <strong>Keš ukupno:</strong>{" "}
                  {form.watch("iznos") -
                    lastStart.iznos -
                    form.watch("plin") -
                    form.watch("benzin") -
                    ukupnoKarticom -
                    ukupnoTroskovi -
                    ukupnoUmanjenje -
                    pranje}
                  RSD
                </p>
              </div>
            )}
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

{
  /* <FormField
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
            /> */
}
{
  /* <FormField
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
            /> */
}
{
  /* <FormField
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
            /> */
}
{
  /* <FormField
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
            /> */
}
{
  /* <FormField
              control={form.control}
              name="plin"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="paragraph-semibold text-dark400_light800 flex">
                    Plin
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
            /> */
}
{
  /* <FormField
              control={form.control}
              name="benzin"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="paragraph-semibold text-dark400_light800 flex">
                    Benzin
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
            /> */
}
{
  /* <div className="flex flex-col gap-3">
              <h3 className="font-bold">Dodatni iznosi</h3>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={naplataKarticom}
                  onChange={(e) => setNaplataKarticom(e.target.value)}
                  placeholder="Unesite iznos"
                />
                <Button type="button" onClick={addAmount}>
                  Dodaj
                </Button>
              </div>

              <ul className="mt-3">
                {kartica.map((amount, index) => (
                  <li key={index} className="text-gray-700">
                    {index + 1}. {amount.toFixed(2)} RSD
                  </li>
                ))}
              </ul>

              <div className="mt-3 font-bold text-lg">
                Ukupan naplaceno karticom: {ukupnoKarticom} RSD
              </div>
            </div> */
}
{
  /* <div className="flex flex-col gap-3">
              <h3 className="font-bold">Troškovi</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Iznos troška"
                    value={noviTrosak.iznosTroska}
                    onChange={(e) =>
                      setNoviTrosak({
                        ...noviTrosak,
                        iznosTroska: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="text"
                    placeholder="Opis troška"
                    value={noviTrosak.opis}
                    onChange={(e) =>
                      setNoviTrosak({ ...noviTrosak, opis: e.target.value })
                    }
                  />
                  <Button type="button" onClick={dodajTrosak}>
                    Dodaj trošak
                  </Button>
                </div>
              </div>
              <ul className="mt-3">
                {troskovi.map((trosak, index) => (
                  <li key={index} className="text-gray-700">
                    {index + 1}. {trosak.opis} - {trosak.iznosTroska.toFixed(2)}{" "}
                    RSD
                  </li>
                ))}
              </ul>

              <div className="mt-3 font-bold text-lg">
                Ukupan trošak: {ukupnoTroskovi.toFixed(2)} RSD
              </div>
            </div> */
}
{
  /* <div className="flex flex-col gap-3">
              <h3 className="font-bold">Umanjenja</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Iznos umanjenja"
                    value={novoUmanjenje.iznosUmanjenja}
                    onChange={(e) =>
                      setNovoUmanjenje({
                        ...novoUmanjenje,
                        iznosUmanjenja: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="text"
                    placeholder="Opis umanjenja"
                    value={novoUmanjenje.opis}
                    onChange={(e) =>
                      setNovoUmanjenje({
                        ...novoUmanjenje,
                        opis: e.target.value,
                      })
                    }
                  />
                  <Button type="button" onClick={dodajUmanjenje}>
                    Dodaj umanjenje
                  </Button>
                </div>
              </div>
              <ul className="mt-3">
                {umanjenje.map((item, i) => (
                  <li key={i} className="text-gray-700">
                    {i + 1}. {item.opis} - {item.iznosUmanjenja} RSD
                  </li>
                ))}
              </ul>

              <div className="mt-3 font-bold text-lg">
                Ukupno umanjenje: {ukupnoUmanjenje.toFixed(2)} RSD
              </div>
            </div> */
}
{
  /* <FormField
              control={form.control}
              name="pranje"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="paragraph-semibold text-dark400_light800 flex">
                    Pranje
                  </FormLabel>
                  <FormControl className="mt-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="no-focus paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 min-h-[36px] border"
                        {...field}
                        readOnly // Ovaj input je samo za prikazivanje, neće biti editovan direktno
                      />
                      <Button type="button" onClick={incrementPranje}>
                        Dodaj 100
                      </Button>
                    </div>
                  </FormControl>

                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            /> */
}
{
  /* <FormField
              control={form.control}
              name="pogresanStart"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="paragraph-semibold text-dark400_light800 flex">
                    Pogrešan start
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
            /> */
}
