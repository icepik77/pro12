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
  conjunction: "☌", opposition: "☍", trine: "△", square: "□", sextile: "⚹"
};

// Функция преобразования орбиса в формат градусов, минут, секунд
const formatOrb = (orb: number): string => {
  const degrees = Math.floor(orb);
  const minutes = Math.floor((orb - degrees) * 60);
  const seconds = Math.floor(((orb - degrees) * 60 - minutes) * 60);
  return `${degrees}° ${minutes}' ${seconds}''`;
};

// Интерфейс пропсов компонента
interface CalendarTableProps {
    planets: Planet[];
    calendar: any;
}

interface CalendarItem {
    date: string;
    aspects: Aspect[];
}
  

// Компонент таблицы аспектов
// Компонент таблицы аспектов
const Calendar: React.FC<CalendarTableProps> = ({calendar, planets}) => {
    const flatAspects = (calendar.filteredResult as CalendarItem[]).flatMap((item: CalendarItem) => item.aspects);
    return (
        <div className="w-full max-w-5xl px-4 py-1 lg:p-4 flex flex-col items-center text-[14px]">
        <h3 className="text-xl font-medium mb-1 lg:mb-4 text-center">Календарь</h3>
        <table className="table-auto w-full max-w-[400px] border-collapse">
            <tbody>
            {flatAspects.map((aspect, index) => {
                const point1Symbol = planetSymbols[aspect.point1Key] || aspect.point1Label;
                const aspectSymbol = aspectSymbols[aspect.aspectKey] || aspect.aspectKey;
                const point2Symbol = planetSymbols[aspect.point2Key] || aspect.point2Label;
                const formattedOrb = formatOrb(aspect.orb);

                const planet1 = planets.find(p => p.name == aspect.point1Key.toLowerCase());
                
                const isRetrograde1 = planet1?.isRetrograde;

                const planet2 = planets.find(p => p.name == aspect.point2Key.toLowerCase());
                const isRetrograde2 = planet2?.isRetrograde;

                // Выбираем цвет для символа аспекта
                let aspectColor = '';
                if (aspect.aspectKey === 'opposition') {
                aspectColor = 'text-red-600'; // Красный для оппозиции
                } else if (['trine', 'sextile'].includes(aspect.aspectKey)) {
                aspectColor = 'text-green-600'; // Зеленый для гармоничных аспектов
                } else if (aspect.aspectKey === 'conjunction') {
                aspectColor = 'text-black'; // Черный для соединений
                } else if (aspect.aspectKey === 'square') {
                aspectColor = 'text-red-600'; // Красный для квадрата
                }

                return (
                <tr
                    key={index}
                    className={`text-left ${index % 2 === 1 ? 'bg-gray-100' : ''} hover:bg-gray-200`}
                >
                    <td className="p-1 font-bold text-base w-[50px]">{point2Symbol} <span className="align-baseline font-normal text-sm">{'т'}</span></td>
                    <td className="p-1 font-bold text-base w-[40px]">
                    <span className={aspectColor}>{aspectSymbol}</span>
                    </td>
                    <td className="p-1 font-bold text-base">{point1Symbol} <span className="align-baseline font-normal text-sm">{isRetrograde2 ? "нR" : ""}</span></td>
                    <td className="p-1">
                        {new Date(calendar.exactTime[index]?.time).toLocaleString('ru-RU')}
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>
        </div>
    );
};

export default Calendar;
