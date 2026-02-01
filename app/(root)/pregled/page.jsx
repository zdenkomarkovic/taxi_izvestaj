"use client";

import {
  GetEndShifts,
  GetEndShiftsCount,
  GetLastEndShiftId,
  DeleteEndShift,
  DeleteAnyEndShift,
  UpdateEndShift,
  ToggleCheckEndShift,
} from "@/lib/actions/endshift.action";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Trash2, Edit, X, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 8;

const Pregled = () => {
  const { data: session } = useSession();
  const [result, setResult] = useState([]);
  const [lastRecordId, setLastRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [editingShift, setEditingShift] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [checkingInProgress, setCheckingInProgress] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      setLoading(true);

      // Obični korisnici vide samo svoje zapise, admini vide sve
      const userId = session?.user?.role === "admin" ? null : session?.user?.id;

      // Filtriraj po datumu samo za obične korisnike (trenutni i prošli mesec)
      let dateFilter = null;
      if (session?.user?.role !== "admin") {
        const now = new Date();
        const firstDayOfCurrentMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        const firstDayOfPreviousMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );

        dateFilter = {
          startDate: firstDayOfPreviousMonth,
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1), // Prvi dan sledećeg meseca
        };
      }

      // Učitaj samo trenutnu stranicu
      const data = await GetEndShifts(
        userId,
        currentPage,
        ITEMS_PER_PAGE,
        dateFilter
      );
      setResult(data);

      // Dobij ukupan broj zapisa
      const count = await GetEndShiftsCount(userId, dateFilter);
      setTotalCount(count);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));

      // Dobij samo ID poslednjeg zapisa bez učitavanja svih podataka
      const lastId = await GetLastEndShiftId();
      setLastRecordId(lastId);

      setLoading(false);
    };

    if (session) {
      fetchData();
    }
  }, [session, currentPage]);

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

      // Vrati se na prvu stranicu i osveži
      setCurrentPage(1);
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
    // Konvertuj createdAt u format za datetime-local input
    const date = new Date(shift.createdAt);
    const dateString = date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm

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
      benzin: shift.benzin || [],
      kartica: shift.kartica || [],
      troskovi: shift.troskovi || [],
      prekoRacuna: shift.prekoRacuna || [],
      umanjenje: shift.umanjenje || [],
      datumVreme: dateString,
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
      // Validacija - proveri da li su sve vrednosti validni brojevi
      const requiredFields = [
        "kmSat",
        "kmSatPocetna",
        "kmTax",
        "kmTaxPocetna",
        "kmGaz",
        "kmGazPocetna",
        "iznos",
        "iznosPocetna",
        "gotovina",
        "plinRacun",
        "plinKilometraza",
      ];

      for (const field of requiredFields) {
        if (isNaN(editFormData[field]) || editFormData[field] === "") {
          alert(`Polje ${field} mora biti validan broj`);
          return;
        }
      }

      // Izračunaj razlike
      const kmSatRazlika = editFormData.kmSat - editFormData.kmSatPocetna;
      const kmTaxRazlika = editFormData.kmTax - editFormData.kmTaxPocetna;
      const kmGazRazlika = editFormData.kmGaz - editFormData.kmGazPocetna;
      const iznosRazlika = editFormData.iznos - editFormData.iznosPocetna;

      const updateData = {
        kmSat: Number(editFormData.kmSat),
        kmSatPocetna: Number(editFormData.kmSatPocetna),
        kmSatRazlika,
        kmTax: Number(editFormData.kmTax),
        kmTaxPocetna: Number(editFormData.kmTaxPocetna),
        kmTaxRazlika,
        kmGaz: Number(editFormData.kmGaz),
        kmGazPocetna: Number(editFormData.kmGazPocetna),
        kmGazRazlika,
        iznos: Number(editFormData.iznos),
        iznosPocetna: Number(editFormData.iznosPocetna),
        iznosRazlika,
        gotovina: Number(editFormData.gotovina),
        plin: {
          racun: Number(editFormData.plinRacun),
          kilometraza: Number(editFormData.plinKilometraza),
        },
        benzin: editFormData.benzin,
        kartica: editFormData.kartica,
        troskovi: editFormData.troskovi,
        prekoRacuna: editFormData.prekoRacuna,
        umanjenje: editFormData.umanjenje,
        createdAt: editFormData.datumVreme,
      };

      await UpdateEndShift(editingShift._id, updateData);
      alert("Zapis uspešno ažuriran");
      window.location.reload();
    } catch (error) {
      alert(error.message || "Greška pri ažuriranju zapisa");
    }
  };

  // Funkcija za čekiranje/rasčekiranje kartice
  const handleToggleCheck = async (e, recordId, currentStatus) => {
    e.preventDefault();
    e.stopPropagation();

    if (checkingInProgress) {
      e.target.checked = currentStatus;
      return;
    }

    const action = currentStatus ? "rasčekirate" : "čekirate";

    if (!confirm(`Da li ste sigurni da želite da ${action} ovu karticu?`)) {
      e.target.checked = currentStatus; // Vrati checkbox na prethodno stanje
      return;
    }

    setCheckingInProgress(true);

    try {
      await ToggleCheckEndShift(recordId, !currentStatus);

      // Ažuriraj state umesto reload
      setResult((prevResult) =>
        prevResult.map((shift) =>
          shift._id === recordId
            ? { ...shift, isChecked: !currentStatus }
            : shift
        )
      );
    } catch (error) {
      alert(error.message || "Greška pri ažuriranju statusa kartice");
      e.target.checked = currentStatus; // Vrati checkbox na prethodno stanje u slučaju greške
    } finally {
      setCheckingInProgress(false);
    }
  };

  if (loading && result.length === 0) {
    return (
      <div className="container px-4 mt-20 mx-auto text-center">
        <div className="text-xl font-semibold">Učitavanje...</div>
      </div>
    );
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  return (
    <>
      {/* Paginacija - Gornja */}
      {totalPages > 1 && (
        <div className="lg:container px-4 mt-20 mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prethodna
            </button>
            <span className="px-4 py-2 font-semibold">
              Strana {currentPage} od {totalPages} ({totalCount} ukupno)
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Sledeća
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className={`lg:container px-4 mx-auto grid md:grid-cols-3 lg:grid-cols-4 relative ${totalPages > 1 ? 'mt-4' : 'mt-20'}`}>
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-xl font-semibold">Učitavanje...</div>
          </div>
        )}
        {result.map((shift) => {
          // Proveri da li je ovaj zapis poslednji u CELOM sistemu
          const isLastRecord = shift._id === lastRecordId;
          // Proveri da li je zapis već obrisan
          const isDeleted = deletedIds.has(shift._id);
          // Proveri da li poslednji zapis pripada trenutnom korisniku
          const isOwnLastRecord =
            isLastRecord && shift.userId === session?.user?.id;

          return (
            <div
              key={shift._id}
              className={`border-2 p-5 m-2 relative transition-colors ${
                shift.isChecked ? "bg-gray-100" : "bg-white"
              }`}
            >
              {/* Checkbox za čekiranje (samo za admina) */}
              {session?.user?.role === "admin" && (
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={shift.isChecked || false}
                    onChange={(e) =>
                      handleToggleCheck(e, shift._id, shift.isChecked)
                    }
                    disabled={checkingInProgress}
                    className="w-5 h-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      shift.isChecked ? "Rasčekiraj karticu" : "Čekiraj karticu"
                    }
                  />
                </div>
              )}
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
                Km sat: {shift.kmSat} -{" "}
                <span
                  className={
                    shift.kmSatPocetnaChanged ? "text-red-600 font-bold" : ""
                  }
                >
                  {shift.kmSatPocetna}
                </span>{" "}
                = {shift.kmSatRazlika}
              </p>
              <p>
                Km tax: {shift.kmTax} -{" "}
                <span
                  className={
                    shift.kmTaxPocetnaChanged ? "text-red-600 font-bold" : ""
                  }
                >
                  {shift.kmTaxPocetna}
                </span>{" "}
                = {shift.kmTaxRazlika}{" "}
              </p>
              <p>
                Km gaz: {shift.kmGaz} -{" "}
                <span
                  className={
                    shift.kmGazPocetnaChanged ? "text-red-600 font-bold" : ""
                  }
                >
                  {shift.kmGazPocetna}
                </span>{" "}
                = {shift.kmGazRazlika}{" "}
              </p>
              <p>
                Taximetar: {shift.iznos} -{" "}
                <span
                  className={
                    shift.iznosPocetnaChanged ? "text-red-600 font-bold" : ""
                  }
                >
                  {shift.iznosPocetna}
                </span>{" "}
                ={" "}
                <b>
                  {shift.iznosRazlika -
                    (shift.umanjenje?.reduce(
                      (sum, item) => sum + item.iznos,
                      0
                    ) || 0)}
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

      {/* Paginacija - Donja */}
      {totalPages > 1 && (
        <div className="lg:container px-4 mt-8 mb-8 mx-auto">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prethodna
            </button>
            <span className="px-4 py-2 font-semibold">
              Strana {currentPage} od {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Sledeća
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
              {/* Datum i vreme */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Datum i vreme
                </label>
                <input
                  type="datetime-local"
                  value={editFormData.datumVreme}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      datumVreme: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

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

              {/* Benzin */}
              <div>
                <label className="block text-sm font-medium mb-1">Benzin</label>
                {editFormData.benzin?.map((value, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => {
                        const newBenzin = [...editFormData.benzin];
                        newBenzin[index] = parseFloat(e.target.value) || 0;
                        setEditFormData({ ...editFormData, benzin: newBenzin });
                      }}
                      className="flex-1 border rounded px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newBenzin = editFormData.benzin.filter(
                          (_, i) => i !== index
                        );
                        setEditFormData({ ...editFormData, benzin: newBenzin });
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                    >
                      Ukloni
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setEditFormData({
                      ...editFormData,
                      benzin: [...(editFormData.benzin || []), 0],
                    });
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
                >
                  Dodaj benzin
                </button>
              </div>

              {/* Kartica */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kartica
                </label>
                {editFormData.kartica?.map((value, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => {
                        const newKartica = [...editFormData.kartica];
                        newKartica[index] = parseFloat(e.target.value) || 0;
                        setEditFormData({
                          ...editFormData,
                          kartica: newKartica,
                        });
                      }}
                      className="flex-1 border rounded px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newKartica = editFormData.kartica.filter(
                          (_, i) => i !== index
                        );
                        setEditFormData({
                          ...editFormData,
                          kartica: newKartica,
                        });
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                    >
                      Ukloni
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setEditFormData({
                      ...editFormData,
                      kartica: [...(editFormData.kartica || []), 0],
                    });
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
                >
                  Dodaj karticu
                </button>
              </div>

              {/* Troškovi */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Troškovi
                </label>
                {editFormData.troskovi?.map((trosak, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="number"
                      placeholder="Iznos"
                      value={trosak.iznos}
                      onChange={(e) => {
                        const newTroskovi = [...editFormData.troskovi];
                        newTroskovi[index].iznos =
                          parseFloat(e.target.value) || 0;
                        setEditFormData({
                          ...editFormData,
                          troskovi: newTroskovi,
                        });
                      }}
                      className="w-1/3 border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Opis"
                      value={trosak.opis}
                      onChange={(e) => {
                        const newTroskovi = [...editFormData.troskovi];
                        newTroskovi[index].opis = e.target.value;
                        setEditFormData({
                          ...editFormData,
                          troskovi: newTroskovi,
                        });
                      }}
                      className="flex-1 border rounded px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newTroskovi = editFormData.troskovi.filter(
                          (_, i) => i !== index
                        );
                        setEditFormData({
                          ...editFormData,
                          troskovi: newTroskovi,
                        });
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                    >
                      Ukloni
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setEditFormData({
                      ...editFormData,
                      troskovi: [
                        ...(editFormData.troskovi || []),
                        { iznos: 0, opis: "" },
                      ],
                    });
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
                >
                  Dodaj trošak
                </button>
              </div>

              {/* Preko računa */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Preko računa
                </label>
                {editFormData.prekoRacuna?.map((racun, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="number"
                      placeholder="Iznos"
                      value={racun.iznos}
                      onChange={(e) => {
                        const newPrekoRacuna = [...editFormData.prekoRacuna];
                        newPrekoRacuna[index].iznos =
                          parseFloat(e.target.value) || 0;
                        setEditFormData({
                          ...editFormData,
                          prekoRacuna: newPrekoRacuna,
                        });
                      }}
                      className="w-1/3 border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Opis"
                      value={racun.opis}
                      onChange={(e) => {
                        const newPrekoRacuna = [...editFormData.prekoRacuna];
                        newPrekoRacuna[index].opis = e.target.value;
                        setEditFormData({
                          ...editFormData,
                          prekoRacuna: newPrekoRacuna,
                        });
                      }}
                      className="flex-1 border rounded px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newPrekoRacuna = editFormData.prekoRacuna.filter(
                          (_, i) => i !== index
                        );
                        setEditFormData({
                          ...editFormData,
                          prekoRacuna: newPrekoRacuna,
                        });
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                    >
                      Ukloni
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setEditFormData({
                      ...editFormData,
                      prekoRacuna: [
                        ...(editFormData.prekoRacuna || []),
                        { iznos: 0, opis: "" },
                      ],
                    });
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
                >
                  Dodaj preko računa
                </button>
              </div>

              {/* Umanjenje */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Umanjenje
                </label>
                {editFormData.umanjenje?.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="number"
                      placeholder="Iznos"
                      value={item.iznos}
                      onChange={(e) => {
                        const newUmanjenje = [...editFormData.umanjenje];
                        newUmanjenje[index].iznos =
                          parseFloat(e.target.value) || 0;
                        setEditFormData({
                          ...editFormData,
                          umanjenje: newUmanjenje,
                        });
                      }}
                      className="w-1/3 border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Opis"
                      value={item.opis}
                      onChange={(e) => {
                        const newUmanjenje = [...editFormData.umanjenje];
                        newUmanjenje[index].opis = e.target.value;
                        setEditFormData({
                          ...editFormData,
                          umanjenje: newUmanjenje,
                        });
                      }}
                      className="flex-1 border rounded px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newUmanjenje = editFormData.umanjenje.filter(
                          (_, i) => i !== index
                        );
                        setEditFormData({
                          ...editFormData,
                          umanjenje: newUmanjenje,
                        });
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                    >
                      Ukloni
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setEditFormData({
                      ...editFormData,
                      umanjenje: [
                        ...(editFormData.umanjenje || []),
                        { iznos: 0, opis: "" },
                      ],
                    });
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
                >
                  Dodaj umanjenje
                </button>
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
