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

const formatPosition = (decimalDegrees: number) => {
  const degrees = Math.floor(decimalDegrees);
  const minutes = Math.floor((decimalDegrees - degrees) * 60);
  const seconds = Math.floor(((decimalDegrees - degrees) * 60 - minutes) * 60);
  return `${degrees}° ${minutes}′ ${seconds}″`;
};

const NatalChart: React.FC<NatalChartProps> = ({ birthData }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [planetPositions, setPlanetPositions] = useState<any[]>([]);

  useEffect(() => {
    if (!birthData.date || !birthData.time || !birthData.latitude || !birthData.longitude) return;

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

    // Формируем данные для вывода положения планет в знаках и домах
    const planetPositionsList = Object.entries(planetsData).map(([key, planet]: any) => {
      if (!planet?.ChartPosition?.Ecliptic?.DecimalDegrees) return null;
    
      const ecliptic = planet.ChartPosition.Ecliptic.DecimalDegrees;
      const sign = getZodiacSign(ecliptic);
      const position = formatPosition(ecliptic);
      const house = findHouseForPlanet(ecliptic, cuspsData);
    
      return {
        name: key,
        sign,
        position,
        house,
      };
    }).filter(Boolean);

    setChartData(astroData);
    setPlanetPositions(planetPositionsList.slice(1));


  }, [birthData]);

  useEffect(() => {
    if (!chartData) return;
    if (!chartRef.current) {
      console.error("Элемент контейнера не найден!");
      return;
    }

    chartRef.current.innerHTML = '';

    const chart = new Chart(chartRef.current.id, 800, 800);
    const radix = chart.radix(chartData);
    radix.aspects();
  }, [chartData]);

  // Функция для получения знака по углу
  const getZodiacSign = (decimalDegrees: number) => {
    const zodiacSigns = [
      'Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'
    ];
    const index = Math.floor(decimalDegrees / 30) % 12;
    return zodiacSigns[index];
  };

  // Функция для нахождения дома для планеты
  const findHouseForPlanet = (decimalDegrees: number, cuspsData: number[]) => {
    for (let i = 0; i < cuspsData.length; i++) {
      const nextIndex = (i + 1) % cuspsData.length;
      const start = cuspsData[i];
      const end = cuspsData[nextIndex];
  
      if (start < end) {
        if (decimalDegrees >= start && decimalDegrees < end) return i + 1;
      } else {
        // Случай, когда дом охватывает 360° переход (например, кусп 12-го дома на 330°, кусп 1-го на 10°)
        if (decimalDegrees >= start || decimalDegrees < end) return i + 1;
      }
    }
    return 12; // Если ничего не найдено, предположим, что это 12-й дом
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div id="chart-container" ref={chartRef} className="w-[800px] h-[800px] border border-gray-300 mb-6"></div>

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
    </div>
  );
};

export default NatalChart;
