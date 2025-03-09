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

    const planetsData = horoscope.CelestialBodies;
    const cuspsData = horoscope.Houses.map((house: any) => house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees);

    // Преобразуем данные в формат, пригодный для astrochart
    const astroData = {
      planets: {
        "Sun": [planetsData.sun?.ChartPosition?.Ecliptic?.DecimalDegrees || 0],  // Солнце
        "Moon": [planetsData.moon?.ChartPosition?.Ecliptic?.DecimalDegrees || 0], // Луна
        "Mercury": [planetsData.mercury?.ChartPosition?.Ecliptic?.DecimalDegrees || 0], // Меркурий
        "Venus": [planetsData.venus?.ChartPosition?.Ecliptic?.DecimalDegrees || 0], // Венера
        "Mars": [planetsData.mars?.ChartPosition?.Ecliptic?.DecimalDegrees || 0], // Марс
        "Jupiter": [planetsData.jupiter?.ChartPosition?.Ecliptic?.DecimalDegrees || 0], // Юпитер
        "Saturn": [planetsData.saturn?.ChartPosition?.Ecliptic?.DecimalDegrees || 0], // Сатурн
        "Uranus": [planetsData.uranus?.ChartPosition?.Ecliptic?.DecimalDegrees || 0], // Уран
        "Neptune": [planetsData.neptune?.ChartPosition?.Ecliptic?.DecimalDegrees || 0], // Нептун
        "Pluto": [planetsData.pluto?.ChartPosition?.Ecliptic?.DecimalDegrees || 0], // Плутон
        "Lilith": [planetsData.lilith?.ChartPosition?.Ecliptic?.DecimalDegrees || 0], // Лилит
        "Chiron": [planetsData.chiron?.ChartPosition?.Ecliptic?.DecimalDegrees || 0], // Хирон
      },
      cusps: cuspsData, // Куспы домов
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
      <div id="chart-container" ref={chartRef} className="w-[800px] h-[800px] border border-gray-300"></div>
    </div>
  );
};

export default NatalChart;
