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

interface House {
  name: string;
  position: string; // Например, "15°"
  sign: string; // Например, "aries"
}

interface HouseTableProps {
  housePositions: House[];
}

const PlanetTable: React.FC<HouseTableProps> = ({ housePositions }) => {
  return (
    <div className="w-full max-w-7xl p-4">
      <h3 className="text-xl font-bold mb-4 text-center">
        Положение домов
      </h3>
      <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-3 text-center">Дом</th>
            <th className="border p-3 text-center">Градусы</th>
            <th className="border p-3 text-center">Знак</th>
          </tr>
        </thead>
        <tbody>
          {housePositions.map((house, index) => {
            const signSymbol = zodiacSymbols[house.sign.toLowerCase()] || house.sign;
            const degrees = house.position.replace("°", ""); // Убираем символ градуса

            return (
              <tr key={index} className="text-center hover:bg-gray-100">
                <td className="border p-3 text-lg">{house.name}</td>
                <td className="border p-3 text-lg">{degrees}°</td>
                <td className="border p-3 text-lg">{signSymbol}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PlanetTable;
