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
    <div className="w-full max-w-7xl p-4">
      <h3 className="text-xl font-bold mb-4 text-center">
        Положение планет в знаках и домах
      </h3>
      <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-3 text-center">Планета</th>
            <th className="border p-3 text-center">Знак</th>
            <th className="border p-3 text-center">Градусы</th>
            <th className="border p-3 text-center">Дом</th>
          </tr>
        </thead>
        <tbody>
          {planetPositions.map((planet, index) => {
            const signSymbol = zodiacSymbols[planet.sign.toLowerCase()] || planet.sign;
            const degrees = planet.position.replace("°", ""); // Убираем символ градуса

            return (
              <tr key={index} className="text-center hover:bg-gray-100">
                <td className="border p-3 text-lg">
                  {planetSymbols[planet.name.toLowerCase()] || planet.name}
                </td>
                <td className="border p-3 text-lg">{signSymbol}</td>
                <td className="border p-3 text-lg">{degrees}°</td>
                <td className="border p-3 text-lg">{planet.house}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PlanetTable;
