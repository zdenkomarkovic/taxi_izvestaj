"use client";

import { GetEndShifts } from "@/lib/actions/endshift.action";
import {
  getUsers,
  updateUserMultiplier,
  addUserNapomena,
  deleteUserNapomena,
} from "@/lib/actions/user.action";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

const PregledPoDanima = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [editingMultiplier, setEditingMultiplier] = useState({});
  const [customAmounts, setCustomAmounts] = useState({}); // Čuva custom iznose po mesecu
  const [napomenaInputs, setNapomenaInputs] = useState({}); // Čuva tekst napomene za svakog korisnika
  const [allShiftsSorted, setAllShiftsSorted] = useState([]); // Svi shift-ovi sortirani po datumu
  const [selectedMonth, setSelectedMonth] = useState(null); // Odabrani mesec za prikaz

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      // Obični korisnici vide samo svoje zapise, admini vide sve
      const userId = session?.user?.role === "admin" ? null : session?.user?.id;

      const data = await GetEndShifts(userId);

      // Učitaj korisnike ako je admin
      if (session?.user?.role === "admin") {
        const allUsers = await getUsers();
        console.log("Loaded users:", allUsers);
        setUsers(allUsers);
      }

      // Grupisanje po mesecu i korisniku
      const grouped = {};

      data.forEach((shift) => {
        const shiftDate = new Date(shift.createdAt);
        const userName = shift.user?.name || "Nepoznat korisnik";

        // Mesec i godina
        const monthYear = shiftDate.toLocaleDateString("sr-RS", {
          month: "long",
          year: "numeric",
          timeZone: "Europe/Belgrade",
        });

        // Inicijalizuj strukture ako ne postoje
        if (!grouped[monthYear]) {
          grouped[monthYear] = {
            users: {},
          };
        }

        if (!grouped[monthYear].users[userName]) {
          grouped[monthYear].users[userName] = [];
        }

        grouped[monthYear].users[userName].push(shift);
      });

      setGroupedData(grouped);

      // Sortiraj sve shift-ove po datumu (najstariji -> najnoviji) za izračunavanje kilometraže
      const sortedShifts = [...data].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setAllShiftsSorted(sortedShifts);

      // Postavi trenutni mesec kao podrazumevani
      if (!selectedMonth && Object.keys(grouped).length > 0) {
        const currentDate = new Date();
        const currentMonthYear = currentDate.toLocaleDateString("sr-RS", {
          month: "long",
          year: "numeric",
          timeZone: "Europe/Belgrade",
        });

        // Ako postoji trenutni mesec u podacima, izaberi ga, inače izaberi najnoviji
        if (grouped[currentMonthYear]) {
          setSelectedMonth(currentMonthYear);
        } else {
          // Izaberi najnoviji mesec
          const sortedMonths = Object.keys(grouped).sort((a, b) => {
            return new Date(b) - new Date(a);
          });
          setSelectedMonth(sortedMonths[0]);
        }
      }

      setLoading(false);
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  // Funkcija koja vraća pređenu kilometražu za sipanje plina
  const getPredjenoKm = (currentShift) => {
    const currentKm = currentShift.plin?.kilometraza || 0;
    if (currentKm === 0) return 0;

    // Pronađi prethodni shift sa sipanjem plina (kronološki pre ovog)
    const currentIndex = allShiftsSorted.findIndex(
      (s) => s._id === currentShift._id
    );

    if (currentIndex <= 0) return 0; // Nema prethodnog

    // Traži unazad prvi shift koji ima sipanje plina
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevKm = allShiftsSorted[i].plin?.kilometraza || 0;
      if (prevKm > 0) {
        return currentKm - prevKm;
      }
    }

    return 0; // Nema prethodnog sipanja
  };

  if (loading) {
    return <div className="container px-4 mt-20 mx-auto">Učitavanje...</div>;
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

  // Izračunaj ukupan iznos po korisniku
  const getUserTotalAmount = (userName) => {
    let total = 0;
    Object.values(groupedData).forEach((monthData) => {
      if (monthData.users[userName]) {
        monthData.users[userName].forEach((shift) => {
          total +=
            (shift.iznosRazlika || 0) -
            (shift.umanjenje?.reduce((s, item) => s + item.iznos, 0) || 0);
        });
      }
    });
    return total;
  };

  // Izračunaj ukupan iznos po korisniku za određeni mesec
  const getUserMonthTotalAmount = (userName, monthYear) => {
    let total = 0;
    const monthData = groupedData[monthYear];
    if (monthData && monthData.users[userName]) {
      monthData.users[userName].forEach((shift) => {
        total +=
          (shift.iznosRazlika || 0) -
          (shift.umanjenje?.reduce((s, item) => s + item.iznos, 0) || 0);
      });
    }
    return total;
  };

  // Izračunaj ukupan pomnožen iznos svih korisnika za određeni mesec
  const getTotalMultipliedAmountsForMonth = (monthYear) => {
    let total = 0;
    users.forEach((user) => {
      const userAmount = getUserMonthTotalAmount(user.name, monthYear);
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

  // Dobij sortirane mesece (najnoviji prvo)
  const availableMonths = Object.keys(groupedData).sort((a, b) => {
    return new Date(b) - new Date(a);
  });

  // Pronađi indeks trenutno odabranog meseca
  const currentIndex = availableMonths.indexOf(selectedMonth);

  // Funkcije za navigaciju
  const goToNextMonth = () => {
    if (currentIndex > 0) {
      setSelectedMonth(availableMonths[currentIndex - 1]);
    }
  };

  const goToPreviousMonth = () => {
    if (currentIndex < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[currentIndex + 1]);
    }
  };

  return (
    <div className="container px-4 mt-20 mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Pregled iznosa razlike po mesecima
      </h1>

      {Object.keys(groupedData).length === 0 ? (
        <p>Nema podataka za prikaz.</p>
      ) : (
        <>
          {/* Kontrole za navigaciju između meseci */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <button
              onClick={goToPreviousMonth}
              disabled={currentIndex >= availableMonths.length - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              ← Prethodni mesec
            </button>

            <div className="text-xl font-bold text-blue-800">
              {selectedMonth}
            </div>

            <button
              onClick={goToNextMonth}
              disabled={currentIndex <= 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Sledeći mesec →
            </button>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4">
          {/* Sekcija za množioce (samo za admina) - uvek prikaži prvo */}
          {isAdmin && users.length > 0 && (
            <div className="border-2 border-purple-600 p-4 bg-purple-50 shadow-lg min-w-[400px] max-w-[400px] flex-shrink-0">
              <h2 className="text-xl font-bold mb-4 text-purple-800 text-center border-b-2 border-purple-600 pb-2">
                Pregled po korisniku - Množioci
              </h2>
              <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
                {users.map((user) => {
                  const userTotal = getUserTotalAmount(user.name);
                  const multiplier = user.multiplier || 1;
                  const calculatedAmount = userTotal * multiplier;

                  return (
                    <div
                      key={user._id}
                      className="border-2 border-purple-300 p-3 rounded-lg bg-white"
                    >
                      <h3 className="font-bold text-base text-purple-700 mb-2">
                        {user.name}
                      </h3>
                      <p className="text-sm mb-1">
                        <strong>Ukupan iznos:</strong> {userTotal.toFixed(2)}{" "}
                        RSD
                      </p>

                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <label className="text-sm font-semibold">
                          Množilac:
                        </label>
                        {editingMultiplier[user._id] ? (
                          <>
                            <input
                              type="number"
                              step="0.01"
                              defaultValue={multiplier}
                              className="border rounded px-2 py-1 w-20"
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
                              className="bg-green-600 text-white px-2 py-1 rounded text-sm"
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
                              className="bg-gray-400 text-white px-2 py-1 rounded text-sm"
                            >
                              Otkaži
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-purple-600">
                              {multiplier}
                            </span>
                            <button
                              onClick={() =>
                                setEditingMultiplier((prev) => ({
                                  ...prev,
                                  [user._id]: true,
                                }))
                              }
                              className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                            >
                              Izmeni
                            </button>
                          </>
                        )}
                      </div>

                      <p className="text-base font-bold text-purple-800 mt-2">
                        Izračunato: {calculatedAmount.toFixed(2)} RSD
                      </p>

                      {/* Napomene sekcija */}
                      <div className="mt-4 pt-3 border-t-2 border-purple-300">
                        <h4 className="text-sm font-bold text-purple-700 mb-2">
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
                            className="flex-1 border rounded px-2 py-1 text-sm"
                          />
                          <button
                            onClick={() => handleAddNapomena(user._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
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
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800">
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
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Obriši napomenu"
                                >
                                  <Trash2 className="w-4 h-4" />
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

          {selectedMonth && groupedData[selectedMonth] && (() => {
            const monthYear = selectedMonth;
            const monthData = groupedData[selectedMonth];

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
                  className="border-2 p-4 bg-white shadow-lg min-w-[800px] flex-shrink-0"
                >
                  <h2 className="text-xl font-bold mb-4 text-blue-500 text-center border-b-2 pb-2">
                    {monthYear}
                  </h2>

                  <div className="flex gap-4">
                    {/* Leva strana - korisnici i iznosi */}
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                className="border-2 border-purple-200 p-3 rounded-lg bg-white"
                              >
                                <p className="font-semibold text-purple-600 text-sm mb-2">
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
                                        className={`text-xs mb-1 ${addSpacing ? 'mt-3 pt-3 border-t border-gray-300' : ''}`}
                                      >
                                        <p>
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
                                          <span className="text-gray-500 text-xs ml-1">
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
                                  <p className="text-xs text-purple-700 font-semibold">
                                    Ukupno: {userMonthTotal} RSD
                                  </p>
                                  {isAdmin && (
                                    <>
                                      {userCardTotal > 0 && (
                                        <p className="text-xs text-blue-600 font-semibold">
                                          Kartice: {userCardTotal} RSD
                                        </p>
                                      )}
                                      {userPlinTotal > 0 && (
                                        <p className="text-xs text-green-600 font-semibold">
                                          Plin: {userPlinTotal} RSD
                                        </p>
                                      )}
                                      {userBenzinTotal > 0 && (
                                        <p className="text-xs text-orange-600 font-semibold">
                                          Benzin: {userBenzinTotal} RSD
                                        </p>
                                      )}
                                      {userTroskoviTotal > 0 && (
                                        <p className="text-xs text-red-600 font-semibold">
                                          Troškovi: {userTroskoviTotal} RSD
                                        </p>
                                      )}
                                      {userPrekoRacunaTotal > 0 && (
                                        <p className="text-xs text-indigo-600 font-semibold">
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

                    {/* Desna strana - potrošnja (samo za admina) */}
                    {isAdmin && monthPotrosnja.length > 0 && (
                      <div className="w-80 border-l-2 border-teal-300 pl-4">
                        <h3 className="text-lg font-bold text-teal-700 mb-3 text-center">
                          📊 Potrošnja
                        </h3>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                          {monthPotrosnja
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-sm bg-teal-50 p-2 rounded"
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
                          <p className="text-sm font-bold text-teal-900 text-center">
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

                  <div className="mt-4 pt-4 border-t-4 border-blue-600 bg-blue-50">
                    <p className="font-bold text-lg text-blue-800 text-center">
                      {monthYear} UKUPNO: {monthTotal} RSD
                    </p>
                    {isAdmin && (
                      <>
                        {monthCardTotal > 0 && (
                          <p className="font-bold text-lg text-blue-600 text-center">
                            {monthYear} KARTICE: {monthCardTotal} RSD
                          </p>
                        )}
                        {monthPlinTotal > 0 && (
                          <p className="font-bold text-lg text-green-600 text-center">
                            {monthYear} PLIN: {monthPlinTotal} RSD
                          </p>
                        )}
                        {monthBenzinTotal > 0 && (
                          <p className="font-bold text-lg text-orange-600 text-center">
                            {monthYear} BENZIN: {monthBenzinTotal} RSD
                          </p>
                        )}
                        {monthTroskoviTotal > 0 && (
                          <p className="font-bold text-lg text-red-600 text-center">
                            {monthYear} TROŠKOVI: {monthTroskoviTotal} RSD
                          </p>
                        )}
                        {monthPrekoRacunaTotal > 0 && (
                          <p className="font-bold text-lg text-indigo-600 text-center">
                            {monthYear} PREKO RAČUNA: {monthPrekoRacunaTotal}{" "}
                            RSD
                          </p>
                        )}

                        {/* Sekcija za izračun (Ukupno - troškovi) */}
                        <div className="mt-4 pt-4 border-t-2 border-gray-400">
                          {(() => {
                            const totalMultipliedUsers =
                              getTotalMultipliedAmountsForMonth(monthYear);
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
                                  <p className="font-bold text-lg text-pink-700 text-center mb-2">
                                    {monthYear} KORISNICI (sa množiocem):{" "}
                                    {totalMultipliedUsers.toFixed(2)} RSD
                                  </p>
                                )}

                                <p className="font-bold text-lg text-purple-800 text-center">
                                  {monthYear} NETO (Ukupno - Plin - Benzin -
                                  Troškovi - Korisnici): {netoAmount.toFixed(2)}{" "}
                                  RSD
                                </p>

                                {/* Input za custom iznos */}
                                <div className="flex items-center justify-center gap-2 mt-3">
                                  <label className="font-semibold">
                                    Oduzmi dodatni iznos:
                                  </label>
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
                                    className="border rounded px-3 py-1 w-32"
                                  />
                                  <span className="font-semibold">RSD</span>
                                </div>

                                {/* Finalni iznos */}
                                {customAmounts[monthYear] &&
                                  parseFloat(customAmounts[monthYear]) > 0 && (
                                    <p className="font-bold text-xl text-green-800 text-center mt-3 bg-green-100 py-2 rounded">
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
