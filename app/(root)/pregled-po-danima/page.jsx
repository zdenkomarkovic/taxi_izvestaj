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

      // Pomoćna funkcija za dobijanje ponedeljka
      const getMonday = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
      };

      // Grupisanje po mesecu, nedelji, i korisniku
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

        // Ponedeljak te nedelje
        const monday = getMonday(shiftDate);
        const mondayKey = monday.toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Europe/Belgrade",
        });

        // Inicijalizuj strukture ako ne postoje
        if (!grouped[monthYear]) {
          grouped[monthYear] = {};
        }

        if (!grouped[monthYear][mondayKey]) {
          grouped[monthYear][mondayKey] = {
            mondayDate: monday,
            users: {},
          };
        }

        if (!grouped[monthYear][mondayKey].users[userName]) {
          grouped[monthYear][mondayKey].users[userName] = [];
        }

        grouped[monthYear][mondayKey].users[userName].push(shift);
      });

      setGroupedData(grouped);
      setLoading(false);
    };

    if (session) {
      fetchData();
    }
  }, [session]);

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
    Object.values(groupedData).forEach((weeks) => {
      Object.values(weeks).forEach((weekData) => {
        if (weekData.users[userName]) {
          weekData.users[userName].forEach((shift) => {
            total +=
              (shift.iznosRazlika || 0) -
              (shift.umanjenje?.reduce((s, item) => s + item.iznos, 0) || 0);
          });
        }
      });
    });
    return total;
  };

  // Izračunaj ukupan iznos po korisniku za određeni mesec
  const getUserMonthTotalAmount = (userName, monthYear) => {
    let total = 0;
    const monthData = groupedData[monthYear];
    if (monthData) {
      Object.values(monthData).forEach((weekData) => {
        if (weekData.users[userName]) {
          weekData.users[userName].forEach((shift) => {
            total +=
              (shift.iznosRazlika || 0) -
              (shift.umanjenje?.reduce((s, item) => s + item.iznos, 0) || 0);
          });
        }
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

  return (
    <div className="container px-4 mt-20 mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Pregled iznosa razlike po mesecima i nedeljama
      </h1>

      {Object.keys(groupedData).length === 0 ? (
        <p>Nema podataka za prikaz.</p>
      ) : (
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

          {Object.entries(groupedData)
            .sort(([monthA], [monthB]) => {
              // Sortiranje po datumu (mesec i godina)
              const dateA = new Date(monthA);
              const dateB = new Date(monthB);
              return dateB - dateA;
            })
            .map(([monthYear, weeks]) => {
              // Izračunaj ukupno za mesec
              const monthTotal = Object.values(weeks).reduce((total, week) => {
                return (
                  total +
                  Object.values(week.users).reduce(
                    (weekTotal, shifts) =>
                      weekTotal +
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
                  )
                );
              }, 0);

              // Izračunaj ukupno kartice za mesec (samo za admina)
              const monthCardTotal = isAdmin
                ? Object.values(weeks).reduce((total, week) => {
                    return (
                      total +
                      Object.values(week.users).reduce(
                        (weekTotal, shifts) =>
                          weekTotal +
                          shifts.reduce(
                            (sum, shift) =>
                              sum +
                              (shift.kartica?.reduce(
                                (s, amount) => s + amount,
                                0
                              ) || 0),
                            0
                          ),
                        0
                      )
                    );
                  }, 0)
                : 0;

              // Izračunaj ukupno plin za mesec (samo za admina)
              const monthPlinTotal = isAdmin
                ? Object.values(weeks).reduce((total, week) => {
                    return (
                      total +
                      Object.values(week.users).reduce(
                        (weekTotal, shifts) =>
                          weekTotal +
                          shifts.reduce(
                            (sum, shift) => sum + (shift.plin?.racun || 0),
                            0
                          ),
                        0
                      )
                    );
                  }, 0)
                : 0;

              // Izračunaj ukupno benzin za mesec (samo za admina)
              const monthBenzinTotal = isAdmin
                ? Object.values(weeks).reduce((total, week) => {
                    return (
                      total +
                      Object.values(week.users).reduce(
                        (weekTotal, shifts) =>
                          weekTotal +
                          shifts.reduce(
                            (sum, shift) =>
                              sum +
                              (shift.benzin?.reduce(
                                (s, amount) => s + amount,
                                0
                              ) || 0),
                            0
                          ),
                        0
                      )
                    );
                  }, 0)
                : 0;

              // Izračunaj ukupno troskovi za mesec (samo za admina)
              const monthTroskoviTotal = isAdmin
                ? Object.values(weeks).reduce((total, week) => {
                    return (
                      total +
                      Object.values(week.users).reduce(
                        (weekTotal, shifts) =>
                          weekTotal +
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
                    );
                  }, 0)
                : 0;

              // Izračunaj ukupno preko racuna za mesec (samo za admina)
              const monthPrekoRacunaTotal = isAdmin
                ? Object.values(weeks).reduce((total, week) => {
                    return (
                      total +
                      Object.values(week.users).reduce(
                        (weekTotal, shifts) =>
                          weekTotal +
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
                    );
                  }, 0)
                : 0;

              return (
                <div
                  key={monthYear}
                  className="border-2 p-4 bg-white shadow-lg min-w-[600px] flex-shrink-0"
                >
                  <h2 className="text-xl font-bold mb-4 text-blue-500 text-center border-b-2 pb-2">
                    {monthYear}
                  </h2>

                  <div className="space-y-6">
                    {Object.entries(weeks)
                      .sort(([, weekA], [, weekB]) => {
                        return weekB.mondayDate - weekA.mondayDate;
                      })
                      .map(([mondayKey, weekData]) => {
                        // Izračunaj ukupno za nedelju
                        const weekTotal = Object.values(weekData.users).reduce(
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

                        // Izračunaj ukupno kartice za nedelju (samo za admina)
                        const weekCardTotal = isAdmin
                          ? Object.values(weekData.users).reduce(
                              (total, shifts) =>
                                total +
                                shifts.reduce(
                                  (sum, shift) =>
                                    sum +
                                    (shift.kartica?.reduce(
                                      (s, amount) => s + amount,
                                      0
                                    ) || 0),
                                  0
                                ),
                              0
                            )
                          : 0;

                        // Izračunaj ukupno plin za nedelju (samo za admina)
                        const weekPlinTotal = isAdmin
                          ? Object.values(weekData.users).reduce(
                              (total, shifts) =>
                                total +
                                shifts.reduce(
                                  (sum, shift) =>
                                    sum + (shift.plin?.racun || 0),
                                  0
                                ),
                              0
                            )
                          : 0;

                        // Izračunaj ukupno benzin za nedelju (samo za admina)
                        const weekBenzinTotal = isAdmin
                          ? Object.values(weekData.users).reduce(
                              (total, shifts) =>
                                total +
                                shifts.reduce(
                                  (sum, shift) =>
                                    sum +
                                    (shift.benzin?.reduce(
                                      (s, amount) => s + amount,
                                      0
                                    ) || 0),
                                  0
                                ),
                              0
                            )
                          : 0;

                        // Izračunaj ukupno troskovi za nedelju (samo za admina)
                        const weekTroskoviTotal = isAdmin
                          ? Object.values(weekData.users).reduce(
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

                        // Izračunaj ukupno preko racuna za nedelju (samo za admina)
                        const weekPrekoRacunaTotal = isAdmin
                          ? Object.values(weekData.users).reduce(
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

                        return (
                          <div
                            key={mondayKey}
                            className="border-l-4 border-green-400 pl-3 bg-gray-50 p-3"
                          >
                            <p className="font-bold text-sm text-gray-800 mb-3">
                              Nedelja: Ponedeljak, {mondayKey}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {Object.entries(weekData.users).map(
                                ([userName, shifts]) => {
                                  const userWeekTotal = shifts.reduce(
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
                                        (sum, shift) =>
                                          sum + (shift.plin?.racun || 0),
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

                                      {shifts.map((shift) => (
                                        <div
                                          key={shift._id}
                                          className="text-xs mb-1"
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
                                      ))}

                                      <div className="mt-2 pt-2 border-t border-purple-200">
                                        <p className="text-xs text-purple-700 font-semibold">
                                          Ukupno: {userWeekTotal} RSD
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
                                                Troškovi: {userTroskoviTotal}{" "}
                                                RSD
                                              </p>
                                            )}
                                            {userPrekoRacunaTotal > 0 && (
                                              <p className="text-xs text-indigo-600 font-semibold">
                                                Preko računa:{" "}
                                                {userPrekoRacunaTotal} RSD
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

                            {/* <div className="mt-3 pt-2 border-t-2 border-green-500">
                              <p className="font-bold text-green-700 text-sm">
                                Nedelja ukupno: {weekTotal} RSD
                              </p>
                              {isAdmin && (
                                <>
                                  {weekCardTotal > 0 && (
                                    <p className="font-bold text-blue-700 text-sm">
                                      Nedelja kartice: {weekCardTotal} RSD
                                    </p>
                                  )}
                                  {weekPlinTotal > 0 && (
                                    <p className="font-bold text-green-700 text-sm">
                                      Nedelja plin: {weekPlinTotal} RSD
                                    </p>
                                  )}
                                  {weekBenzinTotal > 0 && (
                                    <p className="font-bold text-orange-700 text-sm">
                                      Nedelja benzin: {weekBenzinTotal} RSD
                                    </p>
                                  )}
                                  {weekTroskoviTotal > 0 && (
                                    <p className="font-bold text-red-700 text-sm">
                                      Nedelja troškovi: {weekTroskoviTotal} RSD
                                    </p>
                                  )}
                                  {weekPrekoRacunaTotal > 0 && (
                                    <p className="font-bold text-indigo-700 text-sm">
                                      Nedelja preko računa: {weekPrekoRacunaTotal} RSD
                                    </p>
                                  )}
                                </>
                              )}
                            </div> */}
                          </div>
                        );
                      })}
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
            })}
        </div>
      )}
    </div>
  );
};

export default PregledPoDanima;
