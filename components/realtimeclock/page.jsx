"use client";
import React, { useState, useEffect } from "react";

function RealTimeClock() {
  const [dateTime, setDateTime] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  if (!dateTime) {
    return <div>Loading...</div>;
  }
  return (
    <div className="mt-10 text-center">
      <h1>
        {dateTime.toLocaleTimeString("sr-RS")}{" "}
        {dateTime.toLocaleDateString("sr-RS", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </h1>
    </div>
  );
}

export default RealTimeClock;
