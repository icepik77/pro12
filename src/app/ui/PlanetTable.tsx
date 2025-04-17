'use client'

import React from "react";
import { Planet } from "../lib/definitions";

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
  northnode: "☊", // Северный Узел (Раху)
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

interface PlanetTableProps {
  planetPositions: Planet[];
  localPlanetPositions?: Planet[];
}

const PlanetTable: React.FC<PlanetTableProps> = ({ planetPositions, localPlanetPositions }) => {

  return (
    <div className="w-full max-w-7xl px-4 py-1 lg:p-4 flex flex-col items-center text-[14px]">
      <h3 className="text-xl font-medium mb-1 lg:mb-4 text-center">
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
                className={`text-left ${index % 2 === 1 ? 'bg-gray-100' : ''} hover:bg-gray-200`}
              >
                <td className="p-1 text-lg font-bold text-base">
                  {planetSymbols[planet.name.toLowerCase()] || planet.name} <span className="align-baseline font-normal text-sm">{planet.isRetrograde ? "нR" : "н"}</span>
                </td>
                <td className="p-1 font-bold text-base">{signSymbol}</td>
                <td className="p-1">{degrees}</td>
                <td className="p-1">{localPlanetPositions? localPlanetPositions[index].house : planet.house}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PlanetTable;
