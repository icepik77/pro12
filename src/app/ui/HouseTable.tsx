'use client'

import React from "react";

const planetSymbols: Record<string, string> = {
  sun: "☉",     // Солнце
  moon: "☽",    // Луна
  mercury: "☿", // Меркурий
  venus: "♀",   // Венера
  mars: "♂",    // Марс
  jupiter: "♃", // Юпитер
  saturn: "♄",  // Сатурн
  uranus: "♅",  // Уран
  neptune: "♆", // Нептун
  pluto: "♇",   // Плутон
  northnode: "☊", // Северный Узел (Раху)
  lilith: "⚸",  // Лилит
  
};


// Сопоставление знаков зодиака с Unicode-символами
const zodiacSymbols: Record<string, string> = {
  aries: "♈︎",
  taurus: "♉︎",
  gemini: "♊︎",
  cancer: "♋︎",
  leo: "♌︎",
  virgo: "♍︎",
  libra: "♎︎",
  scorpio: "♏︎",
  sagittarius: "♐︎",
  capricorn: "♑︎",
  aquarius: "♒︎",
  pisces: "♓︎"
};

interface House {
  name: string;
  position: string; // Например, "15°"
  sign: string; // Например, "aries"
}

interface HouseTableProps {
  housePositions: House[];
}

const HouseTable: React.FC<HouseTableProps> = ({ housePositions }) => {
  return (
    <div className="w-full max-w-7xl p-4 flex flex-col items-center text-[14px]">
      <h3 className="text-xl font-medium mb-4 text-center">
        Положение домов
      </h3>
      <table className="table-auto w-full max-w-[400px] border-collapse">
        <tbody>
          {housePositions.map((house, index) => {
            const signSymbol = zodiacSymbols[house.sign.toLowerCase()] || house.sign;
            const degrees = house.position; 

            return (
              <tr
                key={index}
                className={`text-left ${index % 2 === 1 ? 'bg-gray-100' : ''} hover:bg-gray-200`}
              >
                <td className="p-1">{house.name}</td>
                <td className="p-1">{degrees}</td>
                <td className="p-1 font-bold text-base">{signSymbol}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


export default HouseTable;
