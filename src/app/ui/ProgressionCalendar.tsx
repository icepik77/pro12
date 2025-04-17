'use client';

import React from "react";
import { Planet, Aspect } from "../lib/definitions";

// Символы планет
const planetSymbols: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  Chiron: "⚷", Lilith: "⚸", NNode: "☊", Southnode: "☋", Sirius: "★"
};

// Символы аспектов
const aspectSymbols: Record<string, string> = {
  conjunction: "☌", opposition: "☍", trine: "△", square: "□", sextile: "⚹"
};

// Компонент прогрессии
interface ProgressionCalendarProps {
  calendarData: {
    start: Date;
    end: Date;
    aspect: Aspect;
  }[];
  planets: Planet[];
}

const ProgressionCalendar: React.FC<ProgressionCalendarProps> = ({ calendarData, planets }) => {
  return (
    <div className="w-full max-w-5xl px-4 py-1 lg:p-4 flex flex-col items-center text-[14px]">
      <h3 className="text-xl font-medium mb-2 lg:mb-4 text-center">Календарь</h3>
      <table className="table-auto w-full max-w-[600px] border-collapse">
        <tbody>
          {calendarData.map(({ start, end, aspect }, index) => {
            const point1Symbol = planetSymbols[aspect.point1Key] || aspect.point1Label;
            const aspectSymbol = aspectSymbols[aspect.aspectKey] || aspect.aspectKey;
            const point2Symbol = planetSymbols[aspect.point2Key] || aspect.point2Label;

            const isRetrograde1 = planets.find(p => p.name === aspect.point1Key.toLowerCase())?.isRetrograde;
            const isRetrograde2 = planets.find(p => p.name === aspect.point2Key.toLowerCase())?.isRetrograde;

            // Цвет для аспекта
            let aspectColor = '';
            if (aspect.aspectKey === 'opposition') {
              aspectColor = 'text-red-600';
            } else if (['trine', 'sextile'].includes(aspect.aspectKey)) {
              aspectColor = 'text-green-600';
            } else if (aspect.aspectKey === 'conjunction') {
              aspectColor = 'text-black';
            } else if (aspect.aspectKey === 'square') {
              aspectColor = 'text-red-600';
            }

            return (
              <tr key={index} className={`${index % 2 === 1 ? 'bg-gray-100' : ''} hover:bg-gray-200`}>
                <td className="p-1 font-bold text-base w-[50px]">
                  {point2Symbol} <span className="align-baseline font-normal text-sm">{isRetrograde2 ? "нR" : ""}</span>
                </td>
                <td className="p-1 font-bold text-base w-[40px]">
                  <span className={aspectColor}>{aspectSymbol}</span>
                </td>
                <td className="p-1 font-bold text-base">
                  {point1Symbol} <span className="align-baseline font-normal text-sm">{isRetrograde1 ? "нR" : ""}</span>
                </td>
                <td className="p-1">
                  {new Date(start).toLocaleDateString('ru-RU')}
                </td>
                <td className="p-1">
                  {new Date(end).toLocaleDateString('ru-RU')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProgressionCalendar;
