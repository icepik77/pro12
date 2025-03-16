'use client'

import React from "react";

// Сопоставление планет и точек с Unicode-символами
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
  chiron: "⚷",  // Хирон
  lilith: "⚸"   // Лилит
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

interface Planet {
  name: string; // Например, "sun"
  sign: string; // Например, "aries"
  position: string; // Например, "15°"
  house: number; // Например, 7
}

interface PlanetTableProps {
  planetPositions: Planet[];
}

const PlanetTable: React.FC<PlanetTableProps> = ({ planetPositions }) => {
  return (
    <div className="w-full max-w-7xl p-4 flex flex-col items-center text-[14px]">
      <h3 className="text-xl font-medium mb-4 text-center">
        Положение планет в знаках и домах
      </h3>
      <table className="table-auto w-full max-w-[400px] border-collapse">
        <tbody>
          {planetPositions.map((planet, index) => {
            const signSymbol = zodiacSymbols[planet.sign.toLowerCase()] || planet.sign;
            const degrees = planet.position;

            return (
              <tr
                key={index}
                className={`text-center ${index % 2 === 1 ? 'bg-gray-100' : ''} hover:bg-gray-200`}
              >
                <td className="p-3 text-lg font-bold">
                  {planetSymbols[planet.name.toLowerCase()] || planet.name}
                </td>
                <td className="p-3 font-bold">{signSymbol}</td>
                <td className="p-3">{degrees}</td>
                <td className="p-3">{planet.house}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


export default PlanetTable;
