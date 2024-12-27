import StartForm from "@/components/forms/StartForm";
import RealTimeClock from "@/components/realtimeclock/page";
import React from "react";

const Home = () => {
  return (
    <div>
      <RealTimeClock />
      <StartForm />
    </div>
  );
};

export default Home;
