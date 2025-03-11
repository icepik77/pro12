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
  setPlanetPositions: (positions: any[]) => void;
}

const formatPosition = (decimalDegrees: number) => {
  const degreesInSign = decimalDegrees % 30; // Ограничиваем до 30 градусов
  const degrees = Math.floor(degreesInSign);
  const minutes = Math.floor((degreesInSign - degrees) * 60);
  const seconds = Math.floor(((degreesInSign - degrees) * 60 - minutes) * 60);
  return `${degrees}° ${minutes}′ ${seconds}″`;
};

const NatalChart: React.FC<NatalChartProps> = ({ birthData, setPlanetPositions }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<any>(null);

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
        "Sun": [planetsData.sun?.ChartPosition?.Ecliptic?.DecimalDegrees || 0],
        "Moon": [planetsData.moon?.ChartPosition?.Ecliptic?.DecimalDegrees || 0],
        "Mercury": [planetsData.mercury?.ChartPosition?.Ecliptic?.DecimalDegrees || 0],
        "Venus": [planetsData.venus?.ChartPosition?.Ecliptic?.DecimalDegrees || 0],
        "Mars": [planetsData.mars?.ChartPosition?.Ecliptic?.DecimalDegrees || 0],
        "Jupiter": [planetsData.jupiter?.ChartPosition?.Ecliptic?.DecimalDegrees || 0],
        "Saturn": [planetsData.saturn?.ChartPosition?.Ecliptic?.DecimalDegrees || 0],
        "Uranus": [planetsData.uranus?.ChartPosition?.Ecliptic?.DecimalDegrees || 0],
        "Neptune": [planetsData.neptune?.ChartPosition?.Ecliptic?.DecimalDegrees || 0],
        "Pluto": [planetsData.pluto?.ChartPosition?.Ecliptic?.DecimalDegrees || 0],
        "Lilith": [horoscope.CelestialPoints.lilith?.ChartPosition.Ecliptic?.DecimalDegrees || 0],
        "Chiron": [planetsData.chiron?.ChartPosition?.Ecliptic?.DecimalDegrees || 0],
      },
      cusps: cuspsData,
    };

    console.log("Данные о планетах", horoscope.CelestialPoints);

    // Формируем данные для таблицы
    const planetPositionsList = Object.entries(planetsData)
    .map(([key, planet]: any) => {
      if (!planet?.ChartPosition?.Ecliptic?.DecimalDegrees) return null;

      const ecliptic = planet.ChartPosition.Ecliptic.DecimalDegrees;
      const sign = getZodiacSign(ecliptic);
      const position = formatPosition(ecliptic);
      const house = findHouseForPlanet(ecliptic, cuspsData);

      return { name: key, sign, position, house };
    })
    .filter(Boolean); // Убираем null-значения

    // Данные о Лилит
    const lilithData = horoscope.CelestialPoints.lilith?.ChartPosition?.Ecliptic?.DecimalDegrees;

    if (lilithData) {
      const sign = getZodiacSign(lilithData);
      const position = formatPosition(lilithData);
      const house = findHouseForPlanet(lilithData, cuspsData);

      // Заменяем последний элемент в списке на Лилит
      if (planetPositionsList.length > 0) {
        planetPositionsList[planetPositionsList.length - 1] = { name: "lilith", sign, position, house };
      } else {
        // Если список пуст, просто добавляем Лилит
        planetPositionsList.push({ name: "lilith", sign, position, house });
      }
    }

    setChartData(astroData);
    setPlanetPositions(planetPositionsList);

  }, [birthData]);

  useEffect(() => {
    if (!chartData || !chartRef.current) return;
  
    const containerSize = chartRef.current.clientWidth;
    const chartSize = Math.min(containerSize, 800);
  
    chartRef.current.innerHTML = '';
  
    const chart = new Chart(chartRef.current.id, chartSize, chartSize);
    const radix = chart.radix(chartData);
    radix.addPointsOfInterest( {"As":[chartData.cusps[0]],"Ic":[chartData.cusps[3]],"Ds":[chartData.cusps[6]],"Mc":[chartData.cusps[9]]});
    radix.aspects();
  }, [chartData]);

  const getZodiacSign = (decimalDegrees: number) => {
    const zodiacSigns: string[] = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const index = Math.floor(decimalDegrees / 30) % 12;
    return zodiacSigns[index];
  };

  const findHouseForPlanet = (decimalDegrees: number, cuspsData: number[]) => {
    for (let i = 0; i < cuspsData.length; i++) {
      const nextIndex = (i + 1) % cuspsData.length;
      const start = cuspsData[i];
      const end = cuspsData[nextIndex];

      if (start < end) {
        if (decimalDegrees >= start && decimalDegrees < end) return i + 1;
      } else {
        if (decimalDegrees >= start || decimalDegrees < end) return i + 1;
      }
    }
    return 12;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-[800px]">
        <div id="chart-container" ref={chartRef} className="w-full aspect-square mb-6"></div>
      </div>
    </div>
  );
};

export default NatalChart;
