"use client";

import {
  GetEndShifts,
  DeleteEndShift,
  DeleteAnyEndShift,
  UpdateEndShift,
} from "@/lib/actions/endshift.action";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Trash2, Edit, X } from "lucide-react";

const Pregled = () => {
  const { data: session } = useSession();
  const [result, setResult] = useState([]);
  const [lastRecordId, setLastRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [editingShift, setEditingShift] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      // Obični korisnici vide samo svoje zapise, admini vide sve
      const userId = session?.user?.role === "admin" ? null : session?.user?.id;

      const data = await GetEndShifts(userId);
      setResult(data);

      // Čuvaj ID poslednjeg zapisa u celom sistemu (bez filtera)
      const allData = await GetEndShifts(null);
      if (allData && allData.length > 0) {
        setLastRecordId(allData[0]._id);
      }

      setLoading(false);
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const handleDelete = async (recordId) => {
    // Proveri da li je zapis već obrisan u ovoj sesiji
    if (deletedIds.has(recordId)) {
      alert("Ovaj zapis je već obrisan");
      return;
    }

    if (
      !confirm(
        "Da li ste sigurni da želite da obrišete svoj poslednji zapis?\n\nNAPOMENA: Možete obrisati samo svoj poslednji unos. Stariji unosi ne mogu biti obrisani."
      )
    ) {
      return;
    }

    setDeleting(true);

    // Odmah dodaj ID u listu obrisanih da spreči duplo klikanje
    setDeletedIds((prev) => new Set([...prev, recordId]));

    try {
      await DeleteEndShift(recordId);

      alert("Zapis uspešno obrisan.");

      // Osveži stranicu nakon pola sekunde
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      alert(error.message || "Greška pri brisanju zapisa");
      // Ukloni ID iz liste obrisanih
      setDeletedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recordId);
        return newSet;
      });
    } finally {
      setDeleting(false);
    }
  };

  // Nova funkcija za admin brisanje bilo kog zapisa
  const handleAdminDelete = async (recordId) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj zapis?")) {
      return;
    }

    setDeleting(true);

    try {
      await DeleteAnyEndShift(recordId);
      alert("Zapis uspešno obrisan");
      window.location.reload();
    } catch (error) {
      alert(error.message || "Greška pri brisanju zapisa");
    } finally {
      setDeleting(false);
    }
  };

  // Funkcija za otvaranje edit modala
  const handleEdit = (shift) => {
    setEditingShift(shift);
    setEditFormData({
      kmSat: shift.kmSat,
      kmSatPocetna: shift.kmSatPocetna,
      kmTax: shift.kmTax,
      kmTaxPocetna: shift.kmTaxPocetna,
      kmGaz: shift.kmGaz,
      kmGazPocetna: shift.kmGazPocetna,
      iznos: shift.iznos,
      iznosPocetna: shift.iznosPocetna,
      gotovina: shift.gotovina,
      plinRacun: shift.plin.racun,
      plinKilometraza: shift.plin.kilometraza,
    });
  };

  // Funkcija za zatvaranje edit modala
  const handleCloseEdit = () => {
    setEditingShift(null);
    setEditFormData({});
  };

  // Funkcija za čuvanje izmena
  const handleSaveEdit = async () => {
    if (!editingShift) return;

    try {
      // Izračunaj razlike
      const kmSatRazlika = editFormData.kmSat - editFormData.kmSatPocetna;
      const kmTaxRazlika = editFormData.kmTax - editFormData.kmTaxPocetna;
      const kmGazRazlika = editFormData.kmGaz - editFormData.kmGazPocetna;
      const iznosRazlika = editFormData.iznos - editFormData.iznosPocetna;

      const updateData = {
        kmSat: editFormData.kmSat,
        kmSatPocetna: editFormData.kmSatPocetna,
        kmSatRazlika,
        kmTax: editFormData.kmTax,
        kmTaxPocetna: editFormData.kmTaxPocetna,
        kmTaxRazlika,
        kmGaz: editFormData.kmGaz,
        kmGazPocetna: editFormData.kmGazPocetna,
        kmGazRazlika,
        iznos: editFormData.iznos,
        iznosPocetna: editFormData.iznosPocetna,
        iznosRazlika,
        gotovina: editFormData.gotovina,
        plin: {
          racun: editFormData.plinRacun,
          kilometraza: editFormData.plinKilometraza,
        },
      };

      await UpdateEndShift(editingShift._id, updateData);
      alert("Zapis uspešno ažuriran");
      window.location.reload();
    } catch (error) {
      alert(error.message || "Greška pri ažuriranju zapisa");
    }
  };

  if (loading) {
    return <div className="container px-4 mt-20 mx-auto">Učitavanje...</div>;
  }

  return (
    <>
      <div className="lg:container px-4 mt-20 mx-auto grid md:grid-cols-3 lg:grid-cols-4">
        {result.map((shift) => {
          // Proveri da li je ovaj zapis poslednji u CELOM sistemu
          const isLastRecord = shift._id === lastRecordId;
          // Proveri da li je zapis već obrisan
          const isDeleted = deletedIds.has(shift._id);
          // Proveri da li poslednji zapis pripada trenutnom korisniku
          const isOwnLastRecord =
            isLastRecord && shift.userId === session?.user?.id;

          return (
            <div key={shift._id} className="border-2 p-5 m-2 relative">
              <p className="font-bold text-purple-600 text-lg mb-2">
                {shift.user?.name || "Nepoznat korisnik"}
              </p>
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
                <b>
                  {shift.iznosRazlika -
                    (shift.umanjenje?.reduce((sum, item) => sum + item.iznos, 0) || 0)}
                </b>
              </p>
              <p>
                Plin: {shift.plin.racun} / km: {shift.plin.kilometraza}
              </p>

              {shift.benzin && shift.benzin.length > 0 ? (
                <p>
                  <span>Benzin: </span>
                  {shift.benzin.join(" + ")} = {""}
                  {shift.benzin.reduce((sum, value) => sum + value, 0)}
                </p>
              ) : (
                <p>Nema evidentiranog benzina</p>
              )}

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
                  {shift.troskovi.reduce(
                    (sum, trosak) => sum + trosak.iznos,
                    0
                  )}
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
                  {shift.prekoRacuna.reduce(
                    (sum, racun) => sum + racun.iznos,
                    0
                  )}
                </p>
              ) : (
                <p>Nema evidentirano preko racuna</p>
              )}
              {shift.umanjenje && shift.umanjenje.length > 0 ? (
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

              <p className="font-bold mt-3">Gotovina: {shift.gotovina} RSD</p>

              {/* Admin dugmad za sve zapise */}
              {session?.user?.role === "admin" && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(shift)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md"
                    title="Izmeni zapis"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAdminDelete(shift._id)}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md disabled:opacity-50"
                    title="Obriši zapis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Postojeće dugme za brisanje poslednjeg zapisa (za obične korisnike) */}
              {session?.user?.role !== "admin" &&
                isOwnLastRecord &&
                !isDeleted && (
                  <button
                    onClick={() => handleDelete(shift._id)}
                    disabled={deleting || isDeleted}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Obriši svoj poslednji zapis"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Izmeni zapis</h2>
              <button
                onClick={handleCloseEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Km Sat (Završno)
                  </label>
                  <input
                    type="number"
                    value={editFormData.kmSat}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        kmSat: parseFloat(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Km Sat (Početno)
                  </label>
                  <input
                    type="number"
                    value={editFormData.kmSatPocetna}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        kmSatPocetna: parseFloat(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Km Tax (Završno)
                  </label>
                  <input
                    type="number"
                    value={editFormData.kmTax}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        kmTax: parseFloat(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Km Tax (Početno)
                  </label>
                  <input
                    type="number"
                    value={editFormData.kmTaxPocetna}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        kmTaxPocetna: parseFloat(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Km Gaz (Završno)
                  </label>
                  <input
                    type="number"
                    value={editFormData.kmGaz}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        kmGaz: parseFloat(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Km Gaz (Početno)
                  </label>
                  <input
                    type="number"
                    value={editFormData.kmGazPocetna}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        kmGazPocetna: parseFloat(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Taximetar (Završno)
                  </label>
                  <input
                    type="number"
                    value={editFormData.iznos}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        iznos: parseFloat(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Taximetar (Početno)
                  </label>
                  <input
                    type="number"
                    value={editFormData.iznosPocetna}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        iznosPocetna: parseFloat(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Plin - Račun
                  </label>
                  <input
                    type="number"
                    value={editFormData.plinRacun}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        plinRacun: parseFloat(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Plin - Kilometraža
                  </label>
                  <input
                    type="number"
                    value={editFormData.plinKilometraza}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        plinKilometraza: parseFloat(e.target.value),
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Gotovina
                </label>
                <input
                  type="number"
                  value={editFormData.gotovina}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      gotovina: parseFloat(e.target.value),
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              >
                Sačuvaj izmene
              </button>
              <button
                onClick={handleCloseEdit}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
              >
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Pregled;
