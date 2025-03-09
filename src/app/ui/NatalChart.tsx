'use client'

import { useEffect, useRef, useState } from 'react';
import Chart from '@astrodraw/astrochart';
import { Origin, Horoscope } from 'circular-natal-horoscope-js';

// Типы для данных
interface ArcDegrees {
  degrees: number;
  minutes: number;
  seconds: number;
}

interface EclipticPosition {
  DecimalDegrees: number;
  ArcDegrees: ArcDegrees;
  ArcDegreesFormatted: string;
  ArcDegreesFormatted30: string;
}

interface ChartPosition {
  StartPosition: {
    Ecliptic: EclipticPosition;
  };
  EndPosition: {
    Ecliptic: EclipticPosition;
  };
}

interface House {
  _language: string;
  id: number;
  label: string;
  ChartPosition: ChartPosition;
  Sign: {
    key: string;
    zodiac: string;
    label: string;
    startDate: Record<string, string>;
    endDate: Record<string, string>;
    zodiacStart: number;
    zodiacEnd: number;
  };
}

const NatalChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<any>(null); // Хранение данных для отрисовки карты

  useEffect(() => {
    // Пример данных для расчёта, укажите свои координаты и дату
    const origin = new Origin({
      year: 1992,
      month: 2,  // 0 = январь, 2 = март
      date: 21,
      hour: 8,
      minute: 45,
      latitude: 51.5074,  // Широта Лондона
      longitude: -0.1278, // Долгота Лондона
    });
    
    // Создаем объект натальной карты
    const horoscope = new Horoscope({
      origin: origin,
      houseSystem: 'placidus',
      zodiac: 'tropical',
      aspectPoints: ['bodies', 'points', 'angles'],
      aspectWithPoints: ['bodies', 'points', 'angles'],
      aspectTypes: ['major', 'minor'],
      customOrbs: {},
      language: 'en',
    });

  
    // console.log(JSON.stringify(horoscope.Houses[0], null, 2));


    // Получаем данные для отрисовки карты
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

    setChartData(astroData);
  }, []);

  useEffect(() => {
    // Когда данные для отрисовки карты готовы
    if (chartData && chartRef.current) {
      const chart = new Chart('paper', 800, 800);

      // Рисуем натальную карту, передавая данные
      const radix = chart.radix(chartData);

      radix.aspects();
    }
  }, [chartData]);

  return (
    <div className='flex flex-row'>
      <div id="paper" ref={chartRef} className='flex w-full'></div>
    </div>
  );
};

export default NatalChart;



