import React from "react";

const zadKmSat = Number(325484);
const zadKmTax = Number(325484);
const zadKmGaz = Number(325484);
const zadIznos = Number(325484);

const Pocetak = () => {
  return (
    <div className="container mx-auto px-[15px] py-[20px] flex flex-col gap-5">
      <h4>Pocetak rada datum - vreme</h4>

      <div className="flex gap-5">
        <label>Kilometraza na satu </label>
        <input type={"number"} className="border-2" />
        <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
        <p>{zadKmSat} - zadnji upis</p>
      </div>
      <div className="flex gap-5">
        <label>Kilometraza na taksimetru </label>
        <input type={"number"} className="border-2" />
        <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
        <p>{zadKmTax} - zadnji upis</p>
      </div>
      <div className="flex gap-5">
        <label>Gazna kilometraza </label>
        <input type={"number"} className="border-2" />
        <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
        <p>{zadKmGaz} - zadnji upis</p>
      </div>
      <div className="flex gap-5">
        <label>Iznos na taksimetru </label>
        <input type={"number"} className="border-2" />
        <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
        <p>{zadIznos} - zadnji upis</p>
      </div>
      <button className="bg-red-500 px-3 py-1 mt-[50px] rounded-md">
        Kreni
      </button>
    </div>
  );
};

export default Pocetak;
