"use client";

import { GetEndShifts } from "@/lib/actions/endshift.action";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const PregledPoDanima = () => {
  const { data: session } = useSession();
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      // Obični korisnici vide samo svoje zapise, admini vide sve
      const userId = session?.user?.role === "admin" ? null : session?.user?.id;

      const data = await GetEndShifts(userId);

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

  return (
    <div className="container px-4 mt-20 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pregled iznosa razlike po mesecima i nedeljama</h1>

      {Object.keys(groupedData).length === 0 ? (
        <p>Nema podataka za prikaz.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(groupedData)
            .sort(([monthA], [monthB]) => {
              // Sortiranje po datumu (mesec i godina)
              const dateA = new Date(monthA);
              const dateB = new Date(monthB);
              return dateB - dateA;
            })
            .map(([monthYear, weeks]) => {
              // Izračunaj ukupno za mesec
              const monthTotal = Object.values(weeks).reduce(
                (total, week) => {
                  return (
                    total +
                    Object.values(week.users).reduce(
                      (weekTotal, shifts) =>
                        weekTotal +
                        shifts.reduce((sum, shift) => sum + (shift.iznosRazlika || 0), 0),
                      0
                    )
                  );
                },
                0
              );

              return (
                <div
                  key={monthYear}
                  className="border-2 p-4 bg-white shadow-lg min-w-[400px] flex-shrink-0"
                >
                  <h2 className="text-xl font-bold mb-4 text-blue-600 text-center border-b-2 pb-2">
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
                            shifts.reduce((sum, shift) => sum + (shift.iznosRazlika || 0), 0),
                          0
                        );

                        return (
                          <div
                            key={mondayKey}
                            className="border-l-4 border-green-400 pl-3 bg-gray-50 p-3"
                          >
                            <p className="font-bold text-sm text-gray-800 mb-3">
                              Nedelja: Ponedeljak, {mondayKey}
                            </p>

                            {Object.entries(weekData.users).map(([userName, shifts]) => {
                              const userWeekTotal = shifts.reduce(
                                (sum, shift) => sum + (shift.iznosRazlika || 0),
                                0
                              );

                              return (
                                <div key={userName} className="mb-3 ml-2">
                                  <p className="font-semibold text-purple-600 text-sm mb-1">
                                    {userName}
                                  </p>

                                  {shifts.map((shift) => (
                                    <div key={shift._id} className="text-xs mb-1 ml-3">
                                      <p>
                                        {new Date(shift.createdAt).toLocaleDateString(
                                          "sr-RS",
                                          {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                            timeZone: "Europe/Belgrade",
                                          }
                                        )}{" "}
                                        - <b>{shift.iznosRazlika} RSD</b>
                                        <span className="text-gray-500 text-xs ml-1">
                                          (
                                          {new Date(shift.createdAt).toLocaleTimeString(
                                            "sr-RS",
                                            {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              timeZone: "Europe/Belgrade",
                                            }
                                          )}
                                          )
                                        </span>
                                      </p>
                                    </div>
                                  ))}

                                  <div className="ml-3 mt-1">
                                    <p className="text-xs text-purple-700 font-semibold">
                                      {userName} ukupno: {userWeekTotal} RSD
                                    </p>
                                  </div>
                                </div>
                              );
                            })}

                            <div className="mt-3 pt-2 border-t-2 border-green-500">
                              <p className="font-bold text-green-700 text-sm">
                                Nedelja ukupno: {weekTotal} RSD
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="mt-4 pt-4 border-t-4 border-blue-600 bg-blue-50">
                    <p className="font-bold text-lg text-blue-800 text-center">
                      {monthYear} UKUPNO: {monthTotal} RSD
                    </p>
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
