import { GetEndShifts } from "@/lib/actions/endshift.action";
import { auth } from "@/auth";
import React from "react";

const Pregled = async () => {
  const session = await auth();

  // Obični korisnici vide samo svoje zapise, admini vide sve
  const userId =
    session?.user?.role === "admin" ? null : session?.user?.id;

  let result = await GetEndShifts(userId);
  return (
    <div className="container px-4 mt-20 mx-auto flex">
      {result.map((shift) => {
        return (
          <div key={shift._id} className="border-2 p-5 m-2">
            <p className="font-bold pb-2">
              {" "}
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
              Km sat: {shift.kmSat} - {shift.kmSatPocetna} ={" "}
              {shift.kmSatRazlika}
            </p>
            <p>
              Km tax: {shift.kmTax} - {shift.kmTaxPocetna} ={" "}
              {shift.kmTaxRazlika}{" "}
            </p>
            <p>
              Km gaz: {shift.kmGaz} - {shift.kmGazPocetna} ={" "}
              {shift.kmGazRazlika}{" "}
            </p>
            <p>
              Taximetar: {shift.iznos} - {shift.iznosPocetna} ={" "}
              {shift.iznosRazlika}{" "}
            </p>
            <p>
              Plin: {shift.plin.racun} / km: {shift.plin.kilometraza}
            </p>
            <p>Benzin - {shift.benzin}</p>

            {shift.kartica && shift.kartica.length > 0 ? (
              <p>
                <span>Kartica: </span>
                {shift.kartica.join(" + ")} = {""}
                {shift.kartica.reduce((sum, value) => sum + value, 0)}
              </p>
            ) : (
              <p>Nema evidentiranih placanja karticom</p>
            )}

            {shift.troskovi && shift.troskovi.length > 0 ? (
              <p>
                <span>Troškovi: </span>
                {shift.troskovi
                  .map((trosak) => `${trosak.iznos} - ${trosak.opis}`)
                  .join(" / ")}{" "}
                ={" "}
                {shift.troskovi.reduce((sum, trosak) => sum + trosak.iznos, 0)}
              </p>
            ) : (
              <p>Nema evidentiranih troskova</p>
            )}
            {shift.prekoRacuna && shift.prekoRacuna.length > 0 ? (
              <p>
                <span>Preko racuna: </span>
                {shift.prekoRacuna
                  .map((racun) => `${racun.iznos} - ${racun.opis}`)
                  .join(" / ")}{" "}
                ={" "}
                {shift.prekoRacuna.reduce((sum, racun) => sum + racun.iznos, 0)}
              </p>
            ) : (
              <p>Nema evidentirano preko racuna</p>
            )}
            {shift.troskovi && shift.troskovi.length > 0 ? (
              <p>
                <span>Umanjenje: </span>
                {shift.umanjenje
                  .map((item) => `${item.iznos} - ${item.opis}`)
                  .join(" / ")}{" "}
                = {shift.umanjenje.reduce((sum, item) => sum + item.iznos, 0)}
              </p>
            ) : (
              <p>Nema evidentiranih umanjenja</p>
            )}

            <p>
              Gotovina: {shift.iznosRazlika} - plin: - Benzin:
              {shift.benzin} = {shift.gotovina}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Pregled;
