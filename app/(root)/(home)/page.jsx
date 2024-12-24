import StartForm from "@/components/forms/StartForm";
import Pocetak from "@/components/pocetak/page";
import RealTimeClock from "@/components/realtimeclock/page";
import Zavrsetak from "@/components/zavrsetak/page";
import React from "react";

const Home = () => {
  return (
    <div>
      <RealTimeClock />
      <StartForm />
      <Zavrsetak />
    </div>
  );
};

export default Home;
