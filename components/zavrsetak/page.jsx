import React from "react";

const dnKmSat = Number(225);
const dnKmTax = Number(221);
const dnKmGaz = Number(120);
const dnIznos = Number(9620);

const Zavrsetak = () => {
  return (
    <div className="container mx-auto px-[15px] py-[20px]">
      <h4>Kraj rada datum - vreme</h4>
      <div className="flex justify-between">
        <div className=" flex flex-col gap-2">
          <div className="flex gap-5">
            <label>Kilometraza na satu </label>
            <input type={"number"} className="border-2" />
            <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
            <p> - {dnKmSat}</p>
          </div>
          <div className="flex gap-5">
            <label>Kilometraza na taksimetru </label>
            <input type={"number"} className="border-2" />
            <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
            <p> - {dnKmTax}</p>
          </div>
          <div className="flex gap-5">
            <label>Gazna kilometraza </label>
            <input type={"number"} className="border-2" />
            <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
            <p> - {dnKmGaz}</p>
          </div>
          <div className="flex gap-5">
            <label>Pogresan start </label>
            <input type={"number"} className="border-2" />
            <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
            <p> - {dnIznos}</p>
          </div>
          <div className="flex gap-5 items-center">
            <label>Pranje 100 din</label>
            <div className="flex gap-2 items-center">
              <button className="bg-red-500 px-3 py-1">-</button> <p>100</p>{" "}
              <button className="bg-red-500 px-3 py-1">+</button>
            </div>
            <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
            <p> - {dnIznos}</p>
          </div>
          <div className="flex gap-5 items-center">
            <label>pogresan start 150 din</label>
            <div className="flex gap-2 items-center">
              <button className="bg-red-500 px-3 py-1">-</button> <p>150</p>{" "}
              <button className="bg-red-500 px-3 py-1">+</button>
            </div>
            <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
            <p> - {dnIznos}</p>
          </div>
          <div className="flex gap-5">
            <label>Naplaceno karticom </label>
            <input type={"number"} className="border-2" />
            <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
            <p> - {dnIznos}</p>
          </div>
          <div className="flex gap-5">
            <label>Plin </label>
            <input type={"number"} className="border-2" />
            <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
            <p> - {dnIznos}</p>
          </div>
          <div className="flex gap-5">
            <label>Benzin</label>
            <input type={"number"} className="border-2" />
            <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
            <p> - {dnIznos}</p>
          </div>
          <div className="flex gap-5">
            <label>Drugi troskovi</label>
            <input
              type={"number"}
              placeholder="Iznos..."
              className="border-2"
            />
            <input type={"text"} placeholder="Opis..." className="border-2" />
            <button className="bg-red-500 px-3 py-1 rounded-md">Potvrdi</button>
            <p> - {dnIznos}</p>
          </div>
        </div>{" "}
        <div className=" flex flex-col gap-2">
          <div className="flex gap-5">
            <p> - {dnKmSat}</p>
            <button className="bg-red-500 px-3 py-1 rounded-md">Ponisti</button>
          </div>
          <div className="flex gap-5">
            <p> - {dnKmTax}</p>
            <button className="bg-red-500 px-3 py-1 rounded-md">Ponisti</button>
          </div>
          <div className="flex gap-5">
            <p> - {dnKmGaz}</p>
            <button className="bg-red-500 px-3 py-1 rounded-md">Ponisti</button>
          </div>
          <div className="flex gap-5">
            <p> - {dnIznos}</p>
            <button className="bg-red-500 px-3 py-1 rounded-md">Ponisti</button>
          </div>
          <div className="flex gap-5 items-center">
            <p> - {dnIznos}</p>
            <button className="bg-red-500 px-3 py-1 rounded-md">Ponisti</button>
          </div>
          <div className="flex gap-5 items-center">
            <p> - {dnIznos}</p>
            <button className="bg-red-500 px-3 py-1 rounded-md">Ponisti</button>
          </div>
          <div className="flex gap-5">
            <p> - {dnIznos}</p>
            <button className="bg-red-500 px-3 py-1 rounded-md">Ponisti</button>
          </div>
          <div className="flex gap-5">
            <p> - {dnIznos}</p>
            <button className="bg-red-500 px-3 py-1 rounded-md">Ponisti</button>
          </div>
          <div className="flex gap-5">
            <p> - {dnIznos}</p>
            <button className="bg-red-500 px-3 py-1 rounded-md">Ponisti</button>
          </div>
          <div className="flex gap-5">
            <p> - {dnIznos}</p>
            <button className="bg-red-500 px-3 py-1 rounded-md">Ponisti</button>
          </div>

          <p>ukupan iznos</p>
        </div>
      </div>

      <button className="bg-red-500 px-3 py-1 mt-[100px] rounded-md">
        Gotovo
      </button>
    </div>
  );
};

export default Zavrsetak;
