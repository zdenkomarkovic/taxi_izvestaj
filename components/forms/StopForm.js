"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StopSchema } from "@/lib/validations";
import { useSession } from "next-auth/react";
import { Form } from "../ui/form";
import { Button } from "../ui/button";
import { CreateEndshift, GetLastEndShift } from "@/lib/actions/endshift.action";
import CustomFormField from "../formField/customFormField/page";
import AddAmountsField from "../formField/addAmountsField/page";
import ComplexFormField from "../formField/complexFormField/page";
import { GetLastStart } from "@/lib/actions/start.action";
import ComplexFormField2 from "../formField/complexFormField2";
import EditableValueField from "../formField/editableValueField/page";

const StopForm = ({ data }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [naplataKarticom, setNaplataKarticom] = useState("");
  const [ukupnoKarticom, setUkupnoKarticom] = useState(0);
  const [kartica, setKartica] = useState([]);

  const [benzin, setBenzin] = useState([]);
  const [ukupnoBenzin, setUkupnoBenzin] = useState(0);
  const [noviBenzin, setNoviBenzin] = useState("");

  const [plin, setPlin] = useState({ racun: "", kilometraza: "" });
  const [noviPlin, setNoviPlin] = useState({});

  const [prekoRacuna, setPrekoRacuna] = useState([]);
  const [ukupnoPrekoRacuna, setUkupnoPrekoRacuna] = useState(0);
  const [novoPrekoRacuna, setNovoPrekoRacuna] = useState({
    iznos: "",
    opis: "",
  });

  const [troskovi, setTroskovi] = useState([]);
  const [ukupnoTroskovi, setUkupnoTroskovi] = useState(0);
  const [noviTrosak, setNoviTrosak] = useState({ iznos: "", opis: "" });

  const [umanjenje, setUmanjenje] = useState([]);
  const [ukupnoUmanjenje, setUkupnoUmanjenje] = useState(0);
  const [novoUmanjenje, setNovoUmanjenje] = useState({
    iznos: "",
    opis: "",
  });
  const [lastStart, setLastStart] = useState(null);
  const [lastEndShift, setLastEndShift] = useState(null);

  useEffect(() => {
    const fetchLastData = async () => {
      try {
        if (!session?.user?.id) return;

        // SVI korisnici vide poslednji unos u celom sistemu (zajednički podaci)
        const userId = null;

        // Učitaj poslednji start (koristimo ga za krajnje vrednosti)
        const startData = await GetLastStart(userId);
        console.log("Last start data:", startData);
        setLastStart(startData);

        // Učitaj poslednji end shift (koristimo ga za početne vrednosti)
        const endShiftData = await GetLastEndShift(userId);
        console.log("Last end shift data:", endShiftData);
        setLastEndShift(endShiftData);

        if (endShiftData) {
          form.reset({
            ...form.getValues(),
            kmSatPocetna: endShiftData.kmSat || "",
            kmTaxPocetna: endShiftData.kmTax || "",
            kmGazPocetna: endShiftData.kmGaz || "",
            iznosPocetna: endShiftData.iznos || "",
          });
        }
      } catch (error) {
        console.error("Error fetching last data:", error);
      }
    };

    if (session) {
      fetchLastData();
    }
  }, [session]);

  const form = useForm({
    resolver: zodResolver(StopSchema),
    defaultValues: {
      kmSatPocetna: "",
      kmTaxPocetna: "",
      kmGazPocetna: "",
      iznosPocetna: "",
      kmSat: "",
      kmTax: "",
      kmGaz: "",
      iznos: "",
    },
  });

  const dodajPlin = () => {
    if (noviPlin.racun && noviPlin.kilometraza) {
      setPlin({
        racun: Number(noviPlin.racun),
        kilometraza: Number(noviPlin.kilometraza),
      });
      console.log(plin);
      // setNoviPlin({
      //   racun: "",
      //   kilometraza: "",
      // });
    } else {
      alert("Molimo unesite sve podatke.");
    }
  };

  const obrisiPlin = () => {
    setPlin({ racun: "", kilometraza: "" });
    setNoviPlin({ racun: "", kilometraza: "" });
  };

  const addAmount = () => {
    if (!naplataKarticom || isNaN(naplataKarticom)) return;

    const newAmount = parseFloat(naplataKarticom);

    setKartica((prevAmounts) => [...prevAmounts, newAmount]);
    setUkupnoKarticom((prevTotal) => prevTotal + newAmount);
    setNaplataKarticom("");
  };

  const removeAmount = (index) => {
    const removedAmount = kartica[index];
    setKartica((prevAmounts) => prevAmounts.filter((_, i) => i !== index));
    setUkupnoKarticom((prevTotal) => prevTotal - removedAmount);
  };

  const dodajBenzin = () => {
    if (!noviBenzin || isNaN(noviBenzin)) return;

    const newAmount = parseFloat(noviBenzin);

    setBenzin((prevAmounts) => [...prevAmounts, newAmount]);
    setUkupnoBenzin((prevTotal) => prevTotal + newAmount);
    setNoviBenzin("");
  };

  const obrisiBenzin = (index) => {
    const removedAmount = benzin[index];
    setBenzin((prevAmounts) => prevAmounts.filter((_, i) => i !== index));
    setUkupnoBenzin((prevTotal) => prevTotal - removedAmount);
  };

  const dodajPrekoRacuna = () => {
    const { iznos, opis } = novoPrekoRacuna;
    if (!iznos || isNaN(iznos)) return;

    const parsedPrekoRacuna = parseFloat(iznos);
    setPrekoRacuna((prev) => [
      ...prev,
      { iznos: parsedPrekoRacuna, opis: opis || "" },
    ]);
    setUkupnoPrekoRacuna((prevTotal) => prevTotal + parsedPrekoRacuna);
    setNovoPrekoRacuna({ iznos: "", opis: "" });
  };

  const obrisiPrekoRacuna = (index) => {
    const removedItem = prekoRacuna[index];
    setPrekoRacuna((prev) => prev.filter((_, i) => i !== index));
    setUkupnoPrekoRacuna((prevTotal) => prevTotal - removedItem.iznos);
  };

  const dodajTrosak = () => {
    const { iznos, opis } = noviTrosak;
    if (!iznos || isNaN(iznos) || !opis.trim()) return;

    const parsedIznos = parseFloat(iznos);
    setTroskovi((prev) => [...prev, { iznos: parsedIznos, opis }]);
    setUkupnoTroskovi((prevTotal) => prevTotal + parsedIznos);
    setNoviTrosak({ iznos: "", opis: "" });
  };

  const obrisiTrosak = (index) => {
    const removedItem = troskovi[index];
    setTroskovi((prev) => prev.filter((_, i) => i !== index));
    setUkupnoTroskovi((prevTotal) => prevTotal - removedItem.iznos);
  };

  const dodajUmanjenje = () => {
    const { iznos, opis } = novoUmanjenje;
    if (!iznos || isNaN(iznos)) return;

    const parsedUmanjenje = parseFloat(iznos);
    setUmanjenje((prev) => [
      ...prev,
      { iznos: parsedUmanjenje, opis: opis || "" },
    ]);
    setUkupnoUmanjenje((prevTotal) => prevTotal + parsedUmanjenje);
    setNovoUmanjenje({ iznos: "", opis: "" });
  };

  const obrisiUmanjenje = (index) => {
    const removedItem = umanjenje[index];
    setUmanjenje((prev) => prev.filter((_, i) => i !== index));
    setUkupnoUmanjenje((prevTotal) => prevTotal - removedItem.iznos);
  };

  const onSubmit = async (values) => {
    try {
      console.log("Form submitted with values:", values);

      if (!session?.user?.id) {
        console.error("User ID not found");
        return;
      }

      // Koristimo vrednosti iz forme za početne vrednosti
      const kmSatPocetna = Number(values.kmSatPocetna) || 0;
      const kmTaxPocetna = Number(values.kmTaxPocetna) || 0;
      const kmGazPocetna = Number(values.kmGazPocetna) || 0;
      const iznosPocetna = Number(values.iznosPocetna) || 0;

      const kmSatRazlika = Number(values.kmSat) - kmSatPocetna;
      const kmTaxRazlika = Number(values.kmTax) - kmTaxPocetna;
      const kmGazRazlika = Number(values.kmGaz) - kmGazPocetna;

      // Izračunaj iznos razliku - ako je negativna, prešlo je preko 1,000,000
      let iznosRazlika = Number(values.iznos) - iznosPocetna;
      if (iznosRazlika < 0) {
        iznosRazlika = 1000000 - iznosPocetna + Number(values.iznos);
      }

      const gotovina =
        iznosRazlika -
        Number(plin.racun) -
        ukupnoBenzin -
        ukupnoKarticom -
        ukupnoPrekoRacuna -
        ukupnoTroskovi -
        ukupnoUmanjenje;

      await CreateEndshift({
        kmSatRazlika: kmSatRazlika,
        kmSatPocetna: kmSatPocetna,
        kmSat: values.kmSat,
        kmTaxRazlika: kmTaxRazlika,
        kmTaxPocetna: kmTaxPocetna,
        kmTax: values.kmTax,
        kmGazRazlika: kmGazRazlika,
        kmGazPocetna: kmGazPocetna,
        kmGaz: values.kmGaz,
        iznosRazlika: iznosRazlika,
        iznosPocetna: iznosPocetna,
        iznos: values.iznos,
        gotovina: gotovina,
        plin: plin,
        benzin: benzin,
        kartica: kartica,
        prekoRacuna: prekoRacuna,
        troskovi: troskovi,
        umanjenje: umanjenje,
        userId: session.user.id,
        path: pathname,
      });

      router.push("pregled");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className=" relative lg:container pl-48 pr-2 flex ml-auto lg:mx-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("Validation errors:", errors);
            })}
            className="flex container flex-col   border p-3 rounded-lg ml-auto"
          >
            {" "}
            {/* Sekcija za početne vrednosti */}
            <div className=" bg-blue-50 p-1 rounded-lg">
              <div className="flex items-center gap-2">
                <EditableValueField
                  name="kmSatPocetna"
                  label=""
                  control={form.control}
                  defaultValue={lastEndShift?.kmSat}
                />
                <EditableValueField
                  name="kmTaxPocetna"
                  label=""
                  control={form.control}
                  defaultValue={lastEndShift?.kmTax}
                />
                <EditableValueField
                  name="kmGazPocetna"
                  label=""
                  control={form.control}
                  defaultValue={lastEndShift?.kmGaz}
                />
                <EditableValueField
                  name="iznosPocetna"
                  label=""
                  control={form.control}
                  defaultValue={lastEndShift?.iznos}
                />
              </div>
            </div>
            {/* Sekcija za krajnje vrednosti */}
            <div className="bg-green-50 p-1 rounded-lg">
              <div className="flex items-center gap-2">
                <CustomFormField
                  name="kmSat"
                  label="Km sat"
                  control={form.control}
                  lastValue={form.watch("kmSatPocetna")}
                />
                <CustomFormField
                  name="kmTax"
                  label="Km tax."
                  control={form.control}
                  lastValue={form.watch("kmTaxPocetna")}
                />
                <CustomFormField
                  name="kmGaz"
                  label="km gaz"
                  control={form.control}
                  lastValue={form.watch("kmGazPocetna")}
                />
                <CustomFormField
                  name="iznos"
                  label="Iznos"
                  placeholder="Iznos na taximetru"
                  control={form.control}
                  lastValue={form.watch("iznosPocetna")}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <AddAmountsField
                title="kartica"
                value={naplataKarticom}
                setValue={setNaplataKarticom}
                items={kartica}
                total={ukupnoKarticom}
                addItem={addAmount}
                removeItem={removeAmount}
              />
              <AddAmountsField
                title="benzin"
                value={noviBenzin}
                setValue={setNoviBenzin}
                items={benzin}
                total={ukupnoBenzin}
                addItem={dodajBenzin}
                removeItem={obrisiBenzin}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ComplexFormField2
                title="plin"
                item={plin}
                newItem={noviPlin}
                setNewItem={setNoviPlin}
                addItem={dodajPlin}
                removeItem={obrisiPlin}
                valueKey="racun"
                descriptionKey="kilometraza"
              />
              <ComplexFormField
                title="Preko racuna"
                items={prekoRacuna}
                total={ukupnoPrekoRacuna}
                newItem={novoPrekoRacuna}
                setNewItem={setNovoPrekoRacuna}
                addItem={dodajPrekoRacuna}
                removeItem={obrisiPrekoRacuna}
                valueKey="iznos"
                descriptionKey="opis"
              />
            </div>
            <div className="flex gap-3">
              <ComplexFormField
                title="Troškovi"
                items={troskovi}
                total={ukupnoTroskovi}
                newItem={noviTrosak}
                setNewItem={setNoviTrosak}
                addItem={dodajTrosak}
                removeItem={obrisiTrosak}
                valueKey="iznos"
                descriptionKey="opis"
              />
              <ComplexFormField
                title="Umanjenja"
                items={umanjenje}
                total={ukupnoUmanjenje}
                newItem={novoUmanjenje}
                setNewItem={setNovoUmanjenje}
                addItem={dodajUmanjenje}
                removeItem={obrisiUmanjenje}
                valueKey="iznos"
                descriptionKey="opis"
              />
            </div>
            {form.watch("iznosPocetna") && form.watch("iznos") && (
              <div className="flex flex-col text-lg absolute left-4 w-[300px]">
                <p>
                  <p>{plin.racun} - plin</p>
                  <p>{ukupnoBenzin} - benzin</p>
                  <p>{ukupnoKarticom} - kartica</p>
                  <p>{ukupnoPrekoRacuna} - preko racuna</p>
                  <p>{ukupnoTroskovi} - troškovi</p>
                  <p>{ukupnoUmanjenje} - umanjenje</p>
                </p>
                <p>
                  <strong>Keš:</strong>{" "}
                  {(() => {
                    let razlika =
                      Number(form.watch("iznos")) -
                      Number(form.watch("iznosPocetna"));
                    if (razlika < 0) {
                      razlika =
                        1000000 -
                        Number(form.watch("iznosPocetna")) +
                        Number(form.watch("iznos"));
                    }
                    return (
                      razlika -
                      Number(plin.racun) -
                      ukupnoBenzin -
                      ukupnoPrekoRacuna -
                      ukupnoKarticom -
                      ukupnoTroskovi -
                      ukupnoUmanjenje
                    );
                  })()}
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
