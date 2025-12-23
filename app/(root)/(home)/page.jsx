"use client";
import StopForm from "@/components/forms/StopForm";
import { GetLastStart } from "@/lib/actions/start.action";
import { useEffect, useState } from "react";
import RealTimeClock from "@/components/realtimeclock/page";
import React from "react";

const Home = () => {
  const [lastStartData, setLastStartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastStart = async () => {
      try {
        const data = await GetLastStart();
        setLastStartData(data);
      } catch (error) {
        console.error("Failed to fetch last start:", error);
      }
    };
    fetchLastStart();
  }, []);

  return (
    <div className="py-5">
      <RealTimeClock />
      <div className="">
        <StopForm data={lastStartData} />
      </div>
    </div>
  );
};

export default Home;
