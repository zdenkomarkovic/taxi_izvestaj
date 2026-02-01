"use client";

import {
  GetAvailableMonths,
  GetEndShiftsByMonth,
  GetPreviousGasFill
} from "@/lib/actions/endshift.action";
import {
  getUsers,
  updateUserMultiplier,
  addUserNapomena,
  deleteUserNapomena,
} from "@/lib/actions/user.action";
import {
  addZamenaUlja,
  getZameneUlja,
  deleteZamenaUlja,
} from "@/lib/actions/zamenaUlja.action";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

const PregledPoDanima = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [monthData, setMonthData] = useState(null); // Podaci za trenutno izabrani mesec
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [editingMultiplier, setEditingMultiplier] = useState({});
  const [customAmounts, setCustomAmounts] = useState({}); // Čuva custom iznose po mesecu
  const [napomenaInputs, setNapomenaInputs] = useState({}); // Čuva tekst napomene za svakog korisnika
  const [zamenaUljaKilometraza, setZamenaUljaKilometraza] = useState(""); // Kilometraža za zamenu ulja
  const [zameneUlja, setZameneUlja] = useState([]); // Lista svih zamena ulja
  const [showZameneUlja, setShowZameneUlja] = useState(false); // Prikaz/sakrivanje istorije
  const [availableMonths, setAvailableMonths] = useState([]); // Lista dostupnih meseci
  const [selectedMonth, setSelectedMonth] = useState(null); // Odabrani mesec za prikaz
  const [previousGasFills, setPreviousGasFills] = useState({}); // Cache za prethodna sipanja plina

  // Učitaj dostupne mesece pri prvom učitavanju
  useEffect(() => {
    const fetchMonths = async () => {
      if (!session?.user?.id) return;

      const userId = session?.user?.role === "admin" ? null : session?.user?.id;
      const isAdmin = session?.user?.role === "admin";

      // Učitaj dostupne mesece
      const months = await GetAvailableMonths(userId, isAdmin);
      setAvailableMonths(months);

      // Postavi trenutni mesec kao podrazumevani
      if (months.length > 0) {
        const currentDate = new Date();
        const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;

        // Pronađi trenutni mesec ili izaberi najnoviji
        const currentMonth = months.find(m => m.key === currentMonthKey);
        setSelectedMonth(currentMonth ? currentMonth.key : months[0].key);
      }

      // Učitaj zamene ulja za sve korisnike
      const zamene = await getZameneUlja();
      setZameneUlja(zamene);

      // Učitaj korisnike samo ako je admin
      if (session?.user?.role === "admin") {
        const allUsers = await getUsers();
        setUsers(allUsers);
      }

      setLoading(false);
    };

    if (session) {
      fetchMonths();
    }
  }, [session]);

  // Učitaj podatke za izabrani mesec
  useEffect(() => {
    const fetchMonthData = async () => {
      if (!session?.user?.id || !selectedMonth) return;

      setLoading(true);

      const userId = session?.user?.role === "admin" ? null : session?.user?.id;
      const monthInfo = availableMonths.find(m => m.key === selectedMonth);

      if (!monthInfo) {
        setLoading(false);
        return;
      }

      // Učitaj podatke za izabrani mesec
      const isAdmin = session?.user?.role === "admin";
      const data = await GetEndShiftsByMonth(userId, monthInfo.year, monthInfo.month, isAdmin);

      // Grupisanje po korisniku
      const grouped = {
        users: {}
      };

      data.forEach((shift) => {
        const userName = shift.user?.name || "Nepoznat korisnik";

        if (!grouped.users[userName]) {
          grouped.users[userName] = [];
        }

        grouped.users[userName].push(shift);
      });

      setMonthData(grouped);

      // Pre-fetch prethodna sipanja plina za sve smene u ovom mesecu
      const gasFills = {};
      for (const shift of data) {
        const currentKm = shift.plin?.kilometraza || 0;
        if (currentKm > 0) {
          const predjenoKm = await GetPreviousGasFill(shift.createdAt, currentKm);
          gasFills[shift._id] = predjenoKm;
        }
      }
      setPreviousGasFills(gasFills);

      setLoading(false);
    };

    if (selectedMonth && availableMonths.length > 0) {
      fetchMonthData();
    }
  }, [session, selectedMonth, availableMonths]);

  // Funkcija koja vraća pređenu kilometražu za sipanje plina
  const getPredjenoKm = (currentShift) => {
    const currentKm = currentShift.plin?.kilometraza || 0;
    if (currentKm === 0) return 0;

    // Koristi keširane vrednosti
    return previousGasFills[currentShift._id] || 0;
  };

  if (loading && !monthData) {
    return (
      <div className="container px-4 mt-20 mx-auto text-center">
        <div className="text-xl font-semibold">Učitavanje...</div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === "admin";

  const handleMultiplierChange = async (userId, newMultiplier) => {
    const multiplierValue = parseFloat(newMultiplier);

    if (isNaN(multiplierValue)) {
      alert("Unesite validan broj!");
      return;
    }

    try {
      console.log("Saving multiplier:", { userId, multiplierValue });

      const result = await updateUserMultiplier({
        userId: userId,
        multiplier: multiplierValue,
      });

      console.log("Update result:", result);

      // Ponovo učitaj korisnike
      const updatedUsers = await getUsers();
      console.log("Reloaded users:", updatedUsers);
      setUsers(updatedUsers);

      setEditingMultiplier((prev) => ({ ...prev, [userId]: false }));

      alert("Množilac uspešno ažuriran!");
    } catch (error) {
      console.error("Full error:", error);
      alert("Greška pri ažuriranju množioca: " + (error?.message || error));
    }
  };

  // Izračunaj ukupan iznos po korisniku za trenutno izabrani mesec
  const getUserMonthTotalAmount = (userName) => {
    let total = 0;
    if (monthData && monthData.users[userName]) {
      monthData.users[userName].forEach((shift) => {
        total +=
          (shift.iznosRazlika || 0) -
          (shift.umanjenje?.reduce((s, item) => s + item.iznos, 0) || 0);
      });
    }
    return total;
  };

  // Izračunaj ukupan pomnožen iznos svih korisnika za trenutno izabrani mesec
  const getTotalMultipliedAmountsForMonth = () => {
    let total = 0;
    users.forEach((user) => {
      const userAmount = getUserMonthTotalAmount(user.name);
      const multiplier = user.multiplier || 1;
      total += userAmount * multiplier;
    });
    return total;
  };

  // Dodaj napomenu korisniku
  const handleAddNapomena = async (userId) => {
    const tekst = napomenaInputs[userId];

    if (!tekst || tekst.trim() === "") {
      alert("Unesite tekst napomene!");
      return;
    }

    try {
      await addUserNapomena({ userId, tekst });

      // Ponovo učitaj korisnike
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);

      // Očisti input
      setNapomenaInputs((prev) => ({ ...prev, [userId]: "" }));

      alert("Napomena uspešno dodata!");
    } catch (error) {
      alert("Greška pri dodavanju napomene: " + (error?.message || error));
    }
  };

  // Obriši napomenu
  const handleDeleteNapomena = async (userId, napomenaId) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovu napomenu?")) {
      return;
    }

    try {
      await deleteUserNapomena({ userId, napomenaId });

      // Ponovo učitaj korisnike
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);

      alert("Napomena uspešno obrisana!");
    } catch (error) {
      alert("Greška pri brisanju napomene: " + (error?.message || error));
    }
  };

  // Dodaj zamenu ulja
  const handleAddZamenaUlja = async () => {
    if (!zamenaUljaKilometraza || zamenaUljaKilometraza.trim() === "") {
      alert("Unesite kilometražu!");
      return;
    }

    if (isNaN(zamenaUljaKilometraza)) {
      alert("Kilometraža mora biti broj!");
      return;
    }

    try {
      await addZamenaUlja(parseFloat(zamenaUljaKilometraza));

      // Ponovo učitaj zamene ulja
      const zamene = await getZameneUlja();
      setZameneUlja(zamene);

      // Očisti input
      setZamenaUljaKilometraza("");

      alert("Zamena ulja uspešno dodata!");
    } catch (error) {
      alert("Greška pri dodavanju zamene ulja: " + (error?.message || error));
    }
  };

  // Obriši zamenu ulja
  const handleDeleteZamenaUlja = async (zamenaId) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovaj zapis?")) {
      return;
    }

    try {
      await deleteZamenaUlja(zamenaId);

      // Ponovo učitaj zamene ulja
      const zamene = await getZameneUlja();
      setZameneUlja(zamene);

      alert("Zapis uspešno obrisan!");
    } catch (error) {
      alert("Greška pri brisanju zapisa: " + (error?.message || error));
    }
  };

  // Pronađi indeks trenutno odabranog meseca
  const currentIndex = availableMonths.findIndex(m => m.key === selectedMonth);

  // Funkcije za navigaciju
  const goToNextMonth = () => {
    if (currentIndex > 0) {
      setSelectedMonth(availableMonths[currentIndex - 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousMonth = () => {
    if (currentIndex < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[currentIndex + 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container px-2 sm:px-4 mt-20 mx-auto max-w-7xl">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">
        Zamena ulja i kilometraža
      </h1>

      {/* Kompaktna sekcija za unos zamene ulja */}
      {(() => {
        // Proveri da li bilo koja smena ima kmSat veći od sledeće zamene
        const sledecaZamenaKm = zameneUlja && zameneUlja.length > 0
          ? zameneUlja[0].kilometraza + 11000
          : null;

        let trebaZamenaUlja = false;
        if (sledecaZamenaKm && monthData) {
          // Pretraži smene u trenutnom mesecu
          Object.values(monthData.users).forEach((shifts) => {
            if (shifts.some(shift => shift.kmSat && shift.kmSat > sledecaZamenaKm)) {
              trebaZamenaUlja = true;
            }
          });
        }

        return (
          <div className={`mb-4 p-2 rounded border-2 ${
            trebaZamenaUlja
              ? "bg-red-100 border-red-500 border-4 animate-pulse"
              : "bg-blue-50 border-blue-300"
          }`}>
            <div className="flex flex-wrap items-center gap-2">
              {zameneUlja && zameneUlja.length > 0 ? (
                <>
                  <span className={`text-sm font-semibold ${
                    trebaZamenaUlja ? "text-red-900" : "text-blue-900"
                  }`}>
                    {zameneUlja[0].kilometraza.toLocaleString("sr-RS")} km
                  </span>
                  <span className={`text-sm ${
                    trebaZamenaUlja ? "text-red-700" : "text-blue-700"
                  }`}>- sledeća zamena</span>
                  <span className="text-sm font-bold text-red-600">
                    {(zameneUlja[0].kilometraza + 11000).toLocaleString("sr-RS")} km
                  </span>
                  {trebaZamenaUlja && (
                    <span className="text-sm font-bold text-red-600 ml-2">
                      ⚠️ ZAMENI ULJE!
                    </span>
                  )}
                  {isAdmin && <span className="text-sm text-gray-400 mx-2">|</span>}
                </>
              ) : (
                isAdmin && <span className="text-sm font-medium text-blue-800">Kilometraža:</span>
              )}
            {isAdmin && (
              <>
                <input
                  type="number"
                  placeholder="km..."
                  value={zamenaUljaKilometraza}
                  onChange={(e) => setZamenaUljaKilometraza(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddZamenaUlja();
                    }
                  }}
                  className="w-32 border border-blue-300 rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={handleAddZamenaUlja}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Dodaj
                </button>
                <button
                  onClick={() => setShowZameneUlja(!showZameneUlja)}
                  className="ml-auto text-blue-700 underline text-sm hover:text-blue-900"
                >
                  {showZameneUlja ? "Sakrij istoriju" : `Prikaži istoriju (${zameneUlja.length})`}
                </button>
              </>
            )}
          </div>

          {/* Collapsible istorija zamena ulja (samo admin) */}
          {isAdmin && showZameneUlja && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto border-t border-blue-300 pt-2">
              {zameneUlja && zameneUlja.length > 0 ? (
                zameneUlja.map((zamena) => (
                  <div
                    key={zamena._id}
                    className="bg-white border border-blue-200 rounded p-2 flex justify-between items-center gap-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">
                        {zamena.kilometraza.toLocaleString("sr-RS")} km
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(zamena.createdAt).toLocaleDateString("sr-RS", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteZamenaUlja(zamena._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Obriši"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic text-center py-2">
                  Nema zapisa
                </p>
              )}
            </div>
          )}
          </div>
        );
      })()}

      {availableMonths.length === 0 ? (
        <p>Nema podataka za prikaz.</p>
      ) : (
        <>
          {/* Kontrole za navigaciju između meseci */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <div className="text-lg sm:text-xl font-bold text-blue-800 order-1 sm:order-2 mb-2 sm:mb-0">
              {availableMonths.find(m => m.key === selectedMonth)?.label || selectedMonth}
            </div>

            <div className="flex gap-2 w-full sm:w-auto order-2 sm:order-none">
              <button
                onClick={goToPreviousMonth}
                disabled={currentIndex >= availableMonths.length - 1}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ← Prethodni
              </button>

              <button
                onClick={goToNextMonth}
                disabled={currentIndex <= 0}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Sledeći →
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 pb-4 relative">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-xl font-semibold">Učitavanje...</div>
            </div>
          )}
          {/* Sekcija za množioce (samo za admina) - uvek prikaži prvo */}
          {isAdmin && users.length > 0 && (
            <div className="border-2 border-purple-600 p-3 sm:p-4 bg-purple-50 shadow-lg w-full lg:min-w-[400px] lg:max-w-[400px] flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-purple-800 text-center border-b-2 border-purple-600 pb-2">
                Pregled po korisniku - Množioci
              </h2>
              <div className="space-y-3 max-h-[600px] lg:max-h-[800px] overflow-y-auto pr-2">
                {users.map((user) => {
                  // Izračunaj iznos samo za trenutno izabrani mesec
                  const userMonthTotal = getUserMonthTotalAmount(user.name);
                  const multiplier = user.multiplier || 1;
                  const calculatedAmount = userMonthTotal * multiplier;

                  return (
                    <div
                      key={user._id}
                      className="border-2 border-purple-300 p-2 sm:p-3 rounded-lg bg-white"
                    >
                      <h3 className="font-bold text-sm sm:text-base text-purple-700 mb-2">
                        {user.name}
                      </h3>
                      <p className="text-xs sm:text-sm mb-1">
                        <strong>Ukupan iznos:</strong> {userMonthTotal.toFixed(2)}{" "}
                        RSD
                      </p>

                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <label className="text-xs sm:text-sm font-semibold">
                          Množilac:
                        </label>
                        {editingMultiplier[user._id] ? (
                          <>
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={multiplier}
                              className="border rounded px-2 py-1 w-16 sm:w-20 text-xs sm:text-sm"
                              id={`multiplier-${user._id}`}
                            />
                            <button
                              onClick={() => {
                                const newValue = document.getElementById(
                                  `multiplier-${user._id}`
                                ).value;
                                const userId =
                                  typeof user._id === "string"
                                    ? user._id
                                    : user._id.toString();
                                handleMultiplierChange(userId, newValue);
                              }}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs sm:text-sm"
                            >
                              Sačuvaj
                            </button>
                            <button
                              onClick={() =>
                                setEditingMultiplier((prev) => ({
                                  ...prev,
                                  [user._id]: false,
                                }))
                              }
                              className="bg-gray-400 text-white px-2 py-1 rounded text-xs sm:text-sm"
                            >
                              Otkaži
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-purple-600 text-sm sm:text-base">
                              {multiplier}
                            </span>
                            <button
                              onClick={() =>
                                setEditingMultiplier((prev) => ({
                                  ...prev,
                                  [user._id]: true,
                                }))
                              }
                              className="bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-sm"
                            >
                              Izmeni
                            </button>
                          </>
                        )}
                      </div>

                      <p className="text-sm sm:text-base font-bold text-purple-800 mt-2">
                        Izračunato: {calculatedAmount.toFixed(2)} RSD
                      </p>

                      {/* Napomene sekcija */}
                      <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t-2 border-purple-300">
                        <h4 className="text-xs sm:text-sm font-bold text-purple-700 mb-2">
                          Napomene:
                        </h4>

                        {/* Input za dodavanje napomene */}
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            placeholder="Unesite napomenu..."
                            value={napomenaInputs[user._id] || ""}
                            onChange={(e) =>
                              setNapomenaInputs((prev) => ({
                                ...prev,
                                [user._id]: e.target.value,
                              }))
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleAddNapomena(user._id);
                              }
                            }}
                            className="flex-1 border rounded px-2 py-1 text-xs sm:text-sm"
                          />
                          <button
                            onClick={() => handleAddNapomena(user._id)}
                            className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-green-700"
                          >
                            Dodaj
                          </button>
                        </div>

                        {/* Prikaz napomena */}
                        {user.napomene && user.napomene.length > 0 ? (
                          <div className="space-y-2">
                            {user.napomene.map((napomena) => (
                              <div
                                key={napomena._id}
                                className="bg-yellow-50 border border-yellow-200 rounded p-2 flex justify-between items-start gap-2"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm text-gray-800 break-words">
                                    {napomena.tekst}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(
                                      napomena.createdAt
                                    ).toLocaleDateString("sr-RS", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDeleteNapomena(user._id, napomena._id)
                                  }
                                  className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                                  title="Obriši napomenu"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">
                            Nema napomena
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedMonth && monthData && (() => {
            const monthYear = availableMonths.find(m => m.key === selectedMonth)?.label || selectedMonth;

            // Izračunaj ukupno za mesec
            const monthTotal = Object.values(monthData.users).reduce(
              (total, shifts) =>
                total +
                shifts.reduce(
                  (sum, shift) =>
                    sum +
                    ((shift.iznosRazlika || 0) -
                      (shift.umanjenje?.reduce(
                        (s, item) => s + item.iznos,
                        0
                      ) || 0)),
                  0
                ),
              0
            );

            // Izračunaj ukupno kartice za mesec (samo za admina)
            const monthCardTotal = isAdmin
              ? Object.values(monthData.users).reduce(
                  (total, shifts) =>
                    total +
                    shifts.reduce(
                      (sum, shift) =>
                        sum +
                        (shift.kartica?.reduce((s, amount) => s + amount, 0) ||
                          0),
                      0
                    ),
                  0
                )
              : 0;

            // Izračunaj ukupno plin za mesec (samo za admina)
            const monthPlinTotal = isAdmin
              ? Object.values(monthData.users).reduce(
                  (total, shifts) =>
                    total +
                    shifts.reduce(
                      (sum, shift) => sum + (shift.plin?.racun || 0),
                      0
                    ),
                  0
                )
              : 0;

            // Izračunaj ukupno benzin za mesec (samo za admina)
            const monthBenzinTotal = isAdmin
              ? Object.values(monthData.users).reduce(
                  (total, shifts) =>
                    total +
                    shifts.reduce(
                      (sum, shift) =>
                        sum +
                        (shift.benzin?.reduce((s, amount) => s + amount, 0) ||
                          0),
                      0
                    ),
                  0
                )
              : 0;

            // Izračunaj ukupno troskovi za mesec (samo za admina)
            const monthTroskoviTotal = isAdmin
              ? Object.values(monthData.users).reduce(
                  (total, shifts) =>
                    total +
                    shifts.reduce(
                      (sum, shift) =>
                        sum +
                        (shift.troskovi?.reduce(
                          (s, item) => s + item.iznos,
                          0
                        ) || 0),
                      0
                    ),
                  0
                )
              : 0;

            // Izračunaj ukupno preko racuna za mesec (samo za admina)
            const monthPrekoRacunaTotal = isAdmin
              ? Object.values(monthData.users).reduce(
                  (total, shifts) =>
                    total +
                    shifts.reduce(
                      (sum, shift) =>
                        sum +
                        (shift.prekoRacuna?.reduce(
                          (s, item) => s + item.iznos,
                          0
                        ) || 0),
                      0
                    ),
                  0
                )
              : 0;

            // Potrošnja za ovaj mesec
            const monthPotrosnja = [];
            Object.values(monthData.users).forEach((shifts) => {
              shifts.forEach((shift) => {
                const plinRacun = shift.plin?.racun || 0;
                const predjenoKm = getPredjenoKm(shift);
                if (plinRacun > 0 && predjenoKm > 0) {
                  monthPotrosnja.push({
                    date: shift.createdAt,
                    potrosnja: (plinRacun / predjenoKm) * 100,
                  });
                }
              });
            });

            return (
                <div
                  key={monthYear}
                  className="border-2 p-3 sm:p-4 bg-white shadow-lg w-full flex-shrink-0"
                >
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-blue-500 text-center border-b-2 pb-2">
                    {monthYear}
                  </h2>

                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Leva strana - korisnici i iznosi */}
                    <div className="flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {Object.entries(monthData.users).map(
                          ([userName, shifts]) => {
                            const userMonthTotal = shifts.reduce(
                              (sum, shift) =>
                                sum +
                                ((shift.iznosRazlika || 0) -
                                  (shift.umanjenje?.reduce(
                                    (s, item) => s + item.iznos,
                                    0
                                  ) || 0)),
                              0
                            );

                            const userCardTotal = isAdmin
                              ? shifts.reduce(
                                  (sum, shift) =>
                                    sum +
                                    (shift.kartica?.reduce(
                                      (s, amount) => s + amount,
                                      0
                                    ) || 0),
                                  0
                                )
                              : 0;

                            const userPlinTotal = isAdmin
                              ? shifts.reduce(
                                  (sum, shift) => sum + (shift.plin?.racun || 0),
                                  0
                                )
                              : 0;

                            const userBenzinTotal = isAdmin
                              ? shifts.reduce(
                                  (sum, shift) =>
                                    sum +
                                    (shift.benzin?.reduce(
                                      (s, amount) => s + amount,
                                      0
                                    ) || 0),
                                  0
                                )
                              : 0;

                            const userTroskoviTotal = isAdmin
                              ? shifts.reduce(
                                  (sum, shift) =>
                                    sum +
                                    (shift.troskovi?.reduce(
                                      (s, item) => s + item.iznos,
                                      0
                                    ) || 0),
                                  0
                                )
                              : 0;

                            const userPrekoRacunaTotal = isAdmin
                              ? shifts.reduce(
                                  (sum, shift) =>
                                    sum +
                                    (shift.prekoRacuna?.reduce(
                                      (s, item) => s + item.iznos,
                                      0
                                    ) || 0),
                                  0
                                )
                              : 0;

                            return (
                              <div
                                key={userName}
                                className="border-2 border-purple-200 p-2 sm:p-3 rounded-lg bg-white"
                              >
                                <p className="font-semibold text-purple-600 text-xs sm:text-sm mb-2">
                                  {userName}
                                </p>

                                {shifts
                                  .sort(
                                    (a, b) =>
                                      new Date(a.createdAt) -
                                      new Date(b.createdAt)
                                  )
                                  .map((shift, index, array) => {
                                    // Funkcija za dobijanje ponedeljka date nedelje
                                    const getMonday = (date) => {
                                      const d = new Date(date);
                                      const day = d.getDay();
                                      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                                      const monday = new Date(d.setDate(diff));
                                      monday.setHours(0, 0, 0, 0);
                                      return monday.getTime();
                                    };

                                    // Proveri da li su trenutni i prethodni unos u različitim nedeljama
                                    let addSpacing = false;
                                    if (index > 0) {
                                      const currentMonday = getMonday(new Date(shift.createdAt));
                                      const prevMonday = getMonday(new Date(array[index - 1].createdAt));

                                      // Ako su ponedeljci različiti, znači da su u različitim nedeljama
                                      if (currentMonday !== prevMonday) {
                                        addSpacing = true;
                                      }
                                    }

                                    return (
                                      <div
                                        key={shift._id}
                                        className={`text-[10px] sm:text-xs mb-1 ${addSpacing ? 'mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-300' : ''}`}
                                      >
                                        <p className="break-words">
                                          {new Date(
                                            shift.createdAt
                                          ).toLocaleDateString("sr-RS", {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                            timeZone: "Europe/Belgrade",
                                          })}{" "}
                                          -{" "}
                                          <b>
                                            {shift.iznosRazlika -
                                              (shift.umanjenje?.reduce(
                                                (s, item) => s + item.iznos,
                                                0
                                              ) || 0)}{" "}
                                            RSD
                                          </b>
                                          <span className="text-gray-500 text-[10px] sm:text-xs ml-1">
                                            (
                                            {new Date(
                                              shift.createdAt
                                            ).toLocaleTimeString("sr-RS", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              timeZone: "Europe/Belgrade",
                                            })}
                                            )
                                          </span>
                                        </p>
                                      </div>
                                    );
                                  })}

                                <div className="mt-2 pt-2 border-t border-purple-200">
                                  <p className="text-[10px] sm:text-xs text-purple-700 font-semibold">
                                    Ukupno: {userMonthTotal} RSD
                                  </p>
                                  {isAdmin && (
                                    <>
                                      {userCardTotal > 0 && (
                                        <p className="text-[10px] sm:text-xs text-blue-600 font-semibold">
                                          Kartice: {userCardTotal} RSD
                                        </p>
                                      )}
                                      {userPlinTotal > 0 && (
                                        <p className="text-[10px] sm:text-xs text-green-600 font-semibold">
                                          Plin: {userPlinTotal} RSD
                                        </p>
                                      )}
                                      {userBenzinTotal > 0 && (
                                        <p className="text-[10px] sm:text-xs text-orange-600 font-semibold">
                                          Benzin: {userBenzinTotal} RSD
                                        </p>
                                      )}
                                      {userTroskoviTotal > 0 && (
                                        <p className="text-[10px] sm:text-xs text-red-600 font-semibold">
                                          Troškovi: {userTroskoviTotal} RSD
                                        </p>
                                      )}
                                      {userPrekoRacunaTotal > 0 && (
                                        <p className="text-[10px] sm:text-xs text-indigo-600 font-semibold">
                                          Preko računa: {userPrekoRacunaTotal}{" "}
                                          RSD
                                        </p>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* Desna strana - potrošnja */}
                    {monthPotrosnja.length > 0 && (
                      <div className="w-full lg:w-80 border-t-2 lg:border-t-0 lg:border-l-2 border-teal-300 pt-4 lg:pt-0 lg:pl-4">
                        <h3 className="text-base sm:text-lg font-bold text-teal-700 mb-3 text-center">
                          📊 Potrošnja
                        </h3>
                        <div className="space-y-2 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                          {monthPotrosnja
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-xs sm:text-sm bg-teal-50 p-2 rounded"
                              >
                                <span className="text-gray-700">
                                  {new Date(item.date).toLocaleDateString("sr-RS", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                                <span className="font-bold text-teal-800">
                                  {item.potrosnja.toFixed(2)} RSD/100km
                                </span>
                              </div>
                            ))}
                        </div>
                        {/* Prosečna potrošnja za mesec */}
                        <div className="mt-3 pt-3 border-t-2 border-teal-400">
                          <p className="text-xs sm:text-sm font-bold text-teal-900 text-center">
                            Prosečno:{" "}
                            {(
                              monthPotrosnja.reduce((sum, item) => sum + item.potrosnja, 0) /
                              monthPotrosnja.length
                            ).toFixed(2)}{" "}
                            RSD/100km
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-4 border-blue-600 bg-blue-50 p-2 sm:p-3">
                    <p className="font-bold text-base sm:text-lg text-blue-800 text-center">
                      {monthYear} UKUPNO: {monthTotal} RSD
                    </p>
                    {isAdmin && (
                      <>
                        {monthCardTotal > 0 && (
                          <p className="font-bold text-sm sm:text-lg text-blue-600 text-center">
                            {monthYear} KARTICE: {monthCardTotal} RSD
                          </p>
                        )}
                        {monthPlinTotal > 0 && (
                          <p className="font-bold text-sm sm:text-lg text-green-600 text-center">
                            {monthYear} PLIN: {monthPlinTotal} RSD
                          </p>
                        )}
                        {monthBenzinTotal > 0 && (
                          <p className="font-bold text-sm sm:text-lg text-orange-600 text-center">
                            {monthYear} BENZIN: {monthBenzinTotal} RSD
                          </p>
                        )}
                        {monthTroskoviTotal > 0 && (
                          <p className="font-bold text-sm sm:text-lg text-red-600 text-center">
                            {monthYear} TROŠKOVI: {monthTroskoviTotal} RSD
                          </p>
                        )}
                        {monthPrekoRacunaTotal > 0 && (
                          <p className="font-bold text-sm sm:text-lg text-indigo-600 text-center">
                            {monthYear} PREKO RAČUNA: {monthPrekoRacunaTotal}{" "}
                            RSD
                          </p>
                        )}

                        {/* Sekcija za izračun (Ukupno - troškovi) */}
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-400">
                          {(() => {
                            const totalMultipliedUsers =
                              getTotalMultipliedAmountsForMonth();
                            const netoAmount =
                              monthTotal -
                              monthPlinTotal -
                              monthBenzinTotal -
                              monthTroskoviTotal -
                              totalMultipliedUsers;

                            return (
                              <>
                                {/* Prikaži iznos korisnika sa množiocem */}
                                {totalMultipliedUsers > 0 && (
                                  <p className="font-bold text-sm sm:text-lg text-pink-700 text-center mb-2">
                                    {monthYear} KORISNICI (sa množiocem):{" "}
                                    {totalMultipliedUsers.toFixed(2)} RSD
                                  </p>
                                )}

                                <p className="font-bold text-sm sm:text-lg text-purple-800 text-center">
                                  {monthYear} NETO (Ukupno - Plin - Benzin -
                                  Troškovi - Korisnici): {netoAmount.toFixed(2)}{" "}
                                  RSD
                                </p>

                                {/* Input za custom iznos */}
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-3">
                                  <label className="font-semibold text-sm sm:text-base">
                                    Oduzmi dodatni iznos:
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      placeholder="0"
                                      value={customAmounts[monthYear] || ""}
                                      onChange={(e) =>
                                        setCustomAmounts((prev) => ({
                                          ...prev,
                                          [monthYear]: e.target.value,
                                        }))
                                      }
                                      className="border rounded px-2 sm:px-3 py-1 w-24 sm:w-32 text-sm sm:text-base"
                                    />
                                    <span className="font-semibold text-sm sm:text-base">RSD</span>
                                  </div>
                                </div>

                                {/* Finalni iznos */}
                                {customAmounts[monthYear] &&
                                  parseFloat(customAmounts[monthYear]) > 0 && (
                                    <p className="font-bold text-lg sm:text-xl text-green-800 text-center mt-3 bg-green-100 py-2 rounded">
                                      {monthYear} FINALNO:{" "}
                                      {(
                                        netoAmount -
                                        parseFloat(
                                          customAmounts[monthYear] || 0
                                        )
                                      ).toFixed(2)}{" "}
                                      RSD
                                    </p>
                                  )}
                              </>
                            );
                          })()}
                        </div>
                      </>
                    )}
                  </div>
                </div>
            );
          })()}
        </div>
        </>
      )}
    </div>
  );
};

export default PregledPoDanima;
