'use client'

import React from "react";

interface Planet {
  name: string;
  sign: string;
  position: string;
  house: number;
}

interface PlanetTableProps {
  planetPositions: Planet[];
}

const PlanetTable: React.FC<PlanetTableProps> = ({ planetPositions }) => {
  return (
    <div className="w-full max-w-7xl p-4">
      <h3 className="text-xl font-bold mb-4">Положение планет в знаках и домах</h3>
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">Планета</th>
            <th className="border p-2 text-left">Положение</th>
            <th className="border p-2 text-left">Дом</th>
          </tr>
        </thead>
        <tbody>
          {planetPositions.map((planet, index) => (
            <tr key={index}>
              <td className="border p-2">{planet.name}</td>
              <td className="border p-2">{planet.sign} {planet.position}</td>
              <td className="border p-2">{planet.house}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlanetTable;
