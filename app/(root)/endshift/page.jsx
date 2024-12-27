"use client";
import StopForm from "@/components/forms/StopForm";
import { GetLastStart } from "@/lib/actions/start.action";
import React, { useEffect, useState } from "react";

const endShift = () => {
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
    <div>
      <StopForm data={lastStartData} />
    </div>
  );
};

export default endShift;
