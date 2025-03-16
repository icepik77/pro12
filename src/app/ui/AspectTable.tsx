'use client';

import React from "react";

// Сопоставление планет с их символами
const planetSymbols: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  chiron: "⚷", lilith: "⚸", northnode: "☊", southnode: "☋", sirius: "★"
};

// Сопоставление аспектов с их символами
const aspectSymbols: Record<string, string> = {
  conjunction: "☌", opposition: "☍", trine: "△", square: "□", sextile: "⚹"
};

// Функция преобразования орбиса в формат градусов, минут, секунд
const formatOrb = (orb: number): string => {
  const degrees = Math.floor(orb);
  const minutes = Math.floor((orb - degrees) * 60);
  const seconds = Math.floor(((orb - degrees) * 60 - minutes) * 60);
  return `${degrees}° ${minutes}' ${seconds}''`;
};

// Интерфейс для аспекта
interface Aspect {
  point1Key: string;
  point1Label: string;
  point2Key: string;
  point2Label: string;
  aspectKey: string;
  orb: number;
}

// Интерфейс пропсов компонента
interface AspectTableProps {
    aspectsPositions: Aspect[];
}

// Компонент таблицы аспектов
const AspectTable: React.FC<AspectTableProps> = ({ aspectsPositions }) => {
  return (
    <div className="w-full max-w-5xl p-4 flex flex-col items-center text-[14px]">
      <h3 className="text-xl font-medium mb-4 text-center">Аспекты</h3>
      <table className="table-auto w-full max-w-[400px] border-collapse">
        <tbody>
          {aspectsPositions.map((aspect, index) => {
            const point1Symbol = planetSymbols[aspect.point1Key] || aspect.point1Label;
            const aspectSymbol = aspectSymbols[aspect.aspectKey] || aspect.aspectKey;
            const point2Symbol = planetSymbols[aspect.point2Key] || aspect.point2Label;
            const formattedOrb = formatOrb(aspect.orb);

            return (
              <tr
                key={index}
                className={`text-center ${index % 2 === 1 ? 'bg-gray-100' : ''} hover:bg-gray-200`}
              >
                <td className="p-3 font-bold text-base">{point1Symbol}</td>
                <td className="p-3 font-bold text-base">{aspectSymbol}</td>
                <td className="p-3 font-bold text-base">{point2Symbol}</td>
                <td className="p-3">{formattedOrb}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AspectTable;
