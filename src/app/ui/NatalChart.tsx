'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from '@astrodraw/astrochart';
import { Origin, Horoscope } from 'circular-natal-horoscope-js';

interface BirthData {
  date: string;
  time: string;
  latitude: string;
  longitude: string;
}

interface NatalChartProps {
  birthData: BirthData;
}

const NatalChart: React.FC<NatalChartProps> = ({ birthData }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (!birthData.date || !birthData.time || !birthData.latitude || !birthData.longitude) return;

    console.log("Полученные данные:", birthData);

    const [year, month, day] = birthData.date.split('-').map(Number);
    const [hour, minute] = birthData.time.split(':').map(Number);
    const latitude = parseFloat(birthData.latitude);
    const longitude = parseFloat(birthData.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      console.error("Некорректные координаты:", latitude, longitude);
      return;
    }

    const origin = new Origin({
      year,
      month: month - 1, // В JS месяцы с 0
      date: day,
      hour,
      minute,
      latitude,
      longitude,
    });

    const horoscope = new Horoscope({
      origin,
      houseSystem: 'placidus',
      zodiac: 'tropical',
      aspectPoints: ['bodies', 'points', 'angles'],
      aspectWithPoints: ['bodies', 'points', 'angles'],
      aspectTypes: ['major', 'minor'],
      customOrbs: {},
      language: 'en',
    });

    console.log("Гороскоп рассчитан:", horoscope);

    const astroData = {
      planets: Object.fromEntries(
        Object.entries(horoscope.CelestialBodies.all).map(([key, body]: any) => [
          key,
          [body.ChartPosition.Ecliptic.DecimalDegrees],
        ])
      ),
      cusps: horoscope.Houses.map((house: any) => house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees),
    };

    console.log("Данные для карты:", astroData);

    setChartData(astroData);
  }, [birthData]);

  useEffect(() => {
    if (!chartData) return;
    if (!chartRef.current) {
      console.error("Элемент контейнера не найден!");
      return;
    }

    console.log("Отрисовка карты с данными:", chartData);

    // Удаляем предыдущий canvas, чтобы не дублировать
    chartRef.current.innerHTML = '';

    const chart = new Chart(chartRef.current.id, 800, 800);
    const radix = chart.radix(chartData);
    radix.aspects();
  }, [chartData]);

  return (
    <div className="flex justify-center items-center w-full">
      <div id="chart-container" ref={chartRef}></div>
    </div>
  );
};

export default NatalChart;
