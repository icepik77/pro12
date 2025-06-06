'use client';

import React from "react";
import { Planet, Aspect } from "../lib/definitions";

// Сопоставление планет с их символами
const planetSymbols: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  Chiron: "⚷", Lilith: "⚸", NNode: "☊", Southnode: "☋", Sirius: "★"
};

// Сопоставление аспектов с их символами
const aspectSymbols: Record<string, string> = {
  conjunction: "☌",    // Соединение
  opposition: "☍",     // Оппозиция
  trine: "△",          // Тригон
  square: "□",         // Квадрат
  sextile: "⚹",        // Секстиль
  semisextile: "⚺",    // Полусекстиль
  quincunx: "⚻"        // Квинконс (150°)
};


// Сопоставление домов с римскими цифрами
const houseRomanNumerals: Record<string, string> = {
  First: "I",
  Second: "II",
  Third: "III",
  Fourth: "IV",
  Fifth: "V",
  Sixth: "VI",
  Seventh: "VII",
  Eighth: "VIII",
  Ninth: "IX",
  Tenth: "X",
  Eleventh: "XI",
  Twelfth: "XII"
};


// Функция преобразования орбиса в формат градусов, минут, секунд
const formatOrb = (orb: number): string => {
  const degrees = Math.floor(orb);
  const minutes = Math.floor((orb - degrees) * 60);
  const seconds = Math.floor(((orb - degrees) * 60 - minutes) * 60);

  if (degrees === 0) {
    return `${minutes}' ${seconds}''`;
  }

  return `${degrees}° ${minutes}' ${seconds}''`;
};

// Интерфейс пропсов компонента
interface AspectTableProps {
    aspectsPositions: Aspect[];
    planets: Planet[]
}

// Компонент таблицы аспектов
// Компонент таблицы аспектов
const AspectTable: React.FC<AspectTableProps> = ({ aspectsPositions, planets }) => {

  

  return (
    <div className="w-full max-w-5xl px-4 py-1 lg:p-4 flex flex-col items-center text-[14px]">
      <h3 className="text-xl font-medium mb-1 lg:mb-4 text-center">Аспекты</h3>
      <table className="table-auto w-full max-w-[400px] border-collapse">
        <tbody>
          {aspectsPositions.map((aspect, index) => {
            const point1Symbol = planetSymbols[aspect.point1Key] || houseRomanNumerals[aspect.point1Label] || aspect.point1Label;
            const aspectSymbol = aspectSymbols[aspect.aspectKey] || aspect.aspectKey;
            const point2Symbol = planetSymbols[aspect.point2Key] || houseRomanNumerals[aspect.point2Label] || aspect.point2Label;
            const formattedOrb = formatOrb(aspect.orb);

            const planet1 = planets.find(p => p.name == aspect.point1Key.toLowerCase());
            
            const isRetrograde1 = planet1?.isRetrograde;

            const planet2 = planets.find(p => p.name == aspect.point2Key.toLowerCase());
            const isRetrograde2 = planet2?.isRetrograde;

            // Выбираем цвет для символа аспекта
            let aspectColor = '';
            if (['opposition', 'square', 'quincunx'].includes(aspect.aspectKey)) {
              aspectColor = 'text-red-600'; // Красный для напряжённых аспектов
            } else if (['trine', 'sextile', 'semisextile'].includes(aspect.aspectKey)) {
              aspectColor = 'text-green-600'; // Зелёный для гармоничных аспектов
            } else if (aspect.aspectKey === 'conjunction') {
              aspectColor = 'text-black'; // Чёрный для соединения (нейтральный)
            }

            return (
              <tr
                key={index}
                className={`text-left ${index % 2 === 1 ? 'bg-gray-100' : ''} hover:bg-gray-200`}
              >
                <td className="p-1 font-bold text-base w-[50px]">{point1Symbol} <span className="align-baseline font-normal text-sm">{isRetrograde1 ? "нR" : "н"}</span></td>
                <td className="p-1 font-bold text-base w-[40px]">
                  <span className={aspectColor}>{aspectSymbol}</span>
                </td>
                <td className="p-1 font-bold text-base">{point2Symbol} <span className="align-baseline font-normal text-sm">{isRetrograde2 ? "нR" : "н"}</span></td>
                <td className="p-1">{formattedOrb}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};




export default AspectTable;
{/* <span className="align-baseline font-normal text-sm">{isRetrograde1 ? "нR" : "н"}</span> */}