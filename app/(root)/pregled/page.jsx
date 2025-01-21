import { GetEndShifts } from "@/lib/actions/endshift.action";
import React from "react";

const Pregled = async () => {
  let result = await GetEndShifts();
  return (
    <div className="container px-4 mt-20 mx-auto flex">
      {result.map((shift, i) => {
        return (
          <div key={i} className="border-2 p-5 m-2">
            <p className="font-bold pb-2">
              Kreirano:{" "}
              {new Date(shift.createdAt).toLocaleDateString("sr-RS", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Belgrade",
              })}
            </p>
            <p>
              Km na satu: {shift.kmSat} - {shift.kmSatPocetna} ={" "}
              {shift.kmSatRazlika}
            </p>
            <p>
              Km na taximetru: {shift.kmTax} - {shift.kmTaxPocetna} ={" "}
              {shift.kmTaxRazlika}{" "}
            </p>
            <p>
              Km gazna: {shift.kmGaz} - {shift.kmGazPocetna} ={" "}
              {shift.kmGazRazlika}{" "}
            </p>

            <p>Plin - {shift.plin}</p>
            <p>Benzin - {shift.benzin}</p>
            <p>Pranje - {shift.pranje}</p>
            <p>Pogresan start - {shift.pogresanStart}</p>

            {shift.kartica && shift.kartica.length > 0 ? (
              <p>
                <span>Kartica: </span>
                {shift.kartica.join(" + ")} = {""}
                {shift.kartica.reduce((sum, value) => sum + value, 0)}
              </p>
            ) : (
              <p>Nema evidentiranih placanja karticom</p>
            )}
            {shift.troskovi.map((trosak, n) => {
              <p key={n}>
                {trosak.iznosTroska} - {trosak.opis}
              </p>;
            })}

            {shift.troskovi && shift.troskovi.length > 0 ? (
              <p>
                <span>Troškovi: </span>
                {shift.troskovi
                  .map((trosak) => `${trosak.iznosTroska} (${trosak.opis})`)
                  .join(" + ")}{" "}
                ={" "}
                {shift.troskovi.reduce(
                  (sum, trosak) => sum + trosak.iznosTroska,
                  0
                )}
              </p>
            ) : (
              <p>Nema evidentiranih troskova</p>
            )}
            <p>
              Taximetar: {shift.iznos} - {shift.iznosPocetna} ={" "}
              {shift.iznosRazlika}{" "}
            </p>
            <p>
              Gotovina: {shift.iznosRazlika} - plin:{shift.plin} - Benzin:
              {shift.benzin} = {shift.gotovina}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Pregled;
