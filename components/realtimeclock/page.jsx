"use client";
import React, { useState, useEffect } from "react";

function RealTimeClock() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    // Postavi interval za ažuriranje svake sekunde
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    // Očisti interval kada se komponenta uništi
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        marginTop: "20px",
      }}
    >
      <h1>
        {dateTime.toLocaleDateString("sr-RS", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </h1>
      <h2>{dateTime.toLocaleTimeString("sr-RS")}</h2>
    </div>
  );
}

export default RealTimeClock;
