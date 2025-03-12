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
    <div className="w-full max-w-5xl p-4">
      <h3 className="text-xl font-bold mb-4 text-center">Аспекты</h3>
      <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-3 text-center">Точка 1</th>
            <th className="border p-3 text-center">Аспект</th>
            <th className="border p-3 text-center">Точка 2</th>
            <th className="border p-3 text-center">Орбис</th>
          </tr>
        </thead>
        <tbody>
          {aspectsPositions.map((aspect, index) => {
            const point1Symbol = planetSymbols[aspect.point1Key] || aspect.point1Label;
            const aspectSymbol = aspectSymbols[aspect.aspectKey] || aspect.aspectKey;
            const point2Symbol = planetSymbols[aspect.point2Key] || aspect.point2Label;
            const formattedOrb = formatOrb(aspect.orb);

            return (
              <tr key={index} className="text-center hover:bg-gray-100">
                <td className="border p-3 text-lg">{point1Symbol}</td>
                <td className="border p-3 text-lg">{aspectSymbol}</td>
                <td className="border p-3 text-lg">{point2Symbol}</td>
                <td className="border p-3 text-lg">{formattedOrb}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AspectTable;
