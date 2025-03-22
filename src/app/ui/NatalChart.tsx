'use client'

import { useEffect, useRef, useState } from 'react';
import Chart from '@astrodraw/astrochart';
import { Origin, Horoscope } from 'circular-natal-horoscope-js';
import { AstroData, NatalChartProps } from '../lib/definitions';
import { formatPosition, getZodiacSign, findHouseForPlanet, createFormedAspects, getAspectsForPlanet } from '../lib/utils';
import { Planet } from '../lib/definitions';

const NatalChart: React.FC<NatalChartProps> = ({ birthData, setPlanetPositions, setHousePositions, setAspectPositions, setLocalTime }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [aspectsData, setAspectsData] = useState<any>(null);
  const [style, setStyle] = useState<string>('elements'); // Добавляем состояние для стиля оформления
  const houseSystem = birthData.houseSystem || 'koch'; // Берём систему домов
  

  // Функция для определения цветов в зависимости от стиля
  const getStyleSettings = () => {
    if (birthData.style === 'heavenly') {
      return {
        SYMBOL_SCALE: 0.8, 
        COLOR_ARIES: "#7D58C6",
        COLOR_TAURUS: "#7D58C6",
        COLOR_GEMINI: "#7D58C6",
        COLOR_CANCER: "#7D58C6",
        COLOR_LEO: "#7D58C6",
        COLOR_VIRGO: "#7D58C6",
        COLOR_LIBRA: "#7D58C6",
        COLOR_SCORPIO: "#7D58C6",
        COLOR_SAGITTARIUS: "#7D58C6",
        COLOR_CAPRICORN: "#7D58C6",
        COLOR_AQUARIUS: "#7D58C6",
        COLOR_PISCES: "#7D58C6",
      };
    } 
    else if (birthData.style === 'management') {
      return {
        SYMBOL_SCALE: 0.8, 
        COLOR_ARIES: "#FFB3A7",  // Овен - пастельный оранжевый
        COLOR_TAURUS: "#FFD1A1", // Телец - пастельный персиковый
        COLOR_GEMINI: "#FFEB8C", // Близнецы - пастельный желтый
        COLOR_CANCER: "#A8E6CF", // Рак - пастельный зеленый
        COLOR_LEO: "#A7C7E7",    // Лев - пастельный голубой
        COLOR_VIRGO: "#D1A7E7",  // Дева - пастельный фиолетовый
        COLOR_LIBRA: "#F7A8D5",  // Весы - пастельный розовый
        COLOR_SCORPIO: "#F5C6A5",// Скорпион - пастельный оранжево-розовый
        COLOR_SAGITTARIUS: "#A8C7FF", // Стрелец - пастельный синий
        COLOR_CAPRICORN: "#A5D3D6", // Козерог - пастельный бирюзовый
        COLOR_AQUARIUS: "#B2E0E6", // Водолей - пастельный голубовато-синий
        COLOR_PISCES: "#B8E5A0",  // Рыбы - пастельный светлый зеленый
        COLORS_SIGNS: [
          "#FFB3A7",  // Овен - пастельный оранжевый
          "#FFD1A1",  // Телец - пастельный персиковый
          "#FFEB8C",  // Близнецы - пастельный желтый
          "#A8E6CF",  // Рак - пастельный зеленый
          "#A7C7E7",  // Лев - пастельный голубой
          "#D1A7E7",  // Дева - пастельный фиолетовый
          "#F7A8D5",  // Весы - пастельный розовый
          "#F5C6A5",  // Скорпион - пастельный оранжево-розовый
          "#A8C7FF",  // Стрелец - пастельный синий
          "#A5D3D6",  // Козерог - пастельный бирюзовый
          "#B2E0E6",  // Водолей - пастельный голубовато-синий
          "#B8E5A0",   // Рыбы - пастельный светлый зеленый
        ]
      };
    }
    else if (birthData.style === 'elements') {
      return {
        SYMBOL_SCALE: 0.8, 
        COLORS_SIGNS: [
          "#FFAD99", // Мягкий красный
          "#D2A679", // Тёплый коричневый
          "#A7C7E7", // Пастельный голубой
          "#9FD3C7", // Нежный бирюзовый
          "#F4A988", // Персиковый
          "#C4A484", // Светлый бежевый
          "#B0D6E8", // Светло-голубой
          "#A3C9A8", // Мягкий зелёный
          "#FFB6A3", // Светлый коралловый
          "#D4A373", // Светло-охристый
          "#C1E1EC", // Голубовато-серый
          "#B5E2B6", // Пастельно-зелёный
        ]
      };
    }
    return {}; // Возвращаем пустой объект по умолчанию
  };

  useEffect(() => {
    if (!birthData.date || !birthData.time || !birthData.latitude || !birthData.longitude) return;

    const [day, month, year] = birthData.date.split('.').map(Number);
    const [hour, minute, second] = birthData.time.split(':').map(Number);
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
      second,
      minute,
      latitude,
      longitude,
    });

    const horoscope = new Horoscope({
      origin,
      houseSystem: houseSystem,
      zodiac: 'tropical',
      aspectPoints: ['bodies', 'points'],
      aspectWithPoints: ['bodies', 'points'],
      aspectTypes: ['major'],
      customOrbs: {},
      language: 'en',
    });

    const planetsData = horoscope.CelestialBodies;
    const cuspsData = horoscope.Houses.map((house: any) => house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees);
    const aspectsData = horoscope.Aspects.all.filter(item => 
      !item.point1Key.toLowerCase().includes('sirius') && 
      !item.point2Key.toLowerCase().includes('sirius') &&
      !item.point1Key.toLowerCase().includes('southnode') && 
      !item.point2Key.toLowerCase().includes('southnode') &&
      !item.point1Key.toLowerCase().includes('chiron') && 
      !item.point2Key.toLowerCase().includes('chiron')
    );


    // Преобразуем данные в формат, пригодный для astrochart
    const astroData : AstroData = {
      planets: {
        "Sun": [planetsData.sun.ChartPosition.Ecliptic.DecimalDegrees || 0],
        "Moon": [planetsData.moon.ChartPosition.Ecliptic.DecimalDegrees || 0],
        "Mercury": [planetsData.mercury.ChartPosition.Ecliptic.DecimalDegrees || 0],
        "Venus": [planetsData.venus.ChartPosition.Ecliptic.DecimalDegrees || 0],
        "Mars": [planetsData.mars.ChartPosition.Ecliptic.DecimalDegrees || 0],
        "Jupiter": [planetsData.jupiter.ChartPosition.Ecliptic.DecimalDegrees || 0],
        "Saturn": [planetsData.saturn.ChartPosition.Ecliptic.DecimalDegrees || 0],
        "Uranus": [planetsData.uranus.ChartPosition.Ecliptic.DecimalDegrees || 0],
        "Neptune": [planetsData.neptune.ChartPosition.Ecliptic.DecimalDegrees || 0],
        "Pluto": [planetsData.pluto.ChartPosition.Ecliptic.DecimalDegrees || 0],
        "Lilith": [horoscope.CelestialPoints.lilith.ChartPosition.Ecliptic.DecimalDegrees || 0],
        "NNode": [horoscope.CelestialPoints.northnode.ChartPosition.Ecliptic.DecimalDegrees || 0],
      },
      cusps: cuspsData,
    };

    console.log("Данные об аспектах", astroData.planets);
    const utcTime = origin.localTimeFormatted?.slice(-6) || ""; 
    if (setLocalTime) {
      setLocalTime(utcTime);
    }

    // Формируем данные для таблицы
    const planetPositionsList = Object.entries(planetsData)
    .map(([key, planet]: any) => {
      if (!planet?.ChartPosition?.Ecliptic?.DecimalDegrees) return null;

      const ecliptic = planet.ChartPosition.Ecliptic.DecimalDegrees;
      const isRetrograde = planet.isRetrograde;
      const sign = getZodiacSign(ecliptic);
      const position = formatPosition(ecliptic);
      const house = findHouseForPlanet(ecliptic, cuspsData);

      return { name: key, isRetrograde, sign, position, house };
    })
    .filter(Boolean); // Убираем null-значения

    // Данные о Лилит
    const lilithData = horoscope.CelestialPoints.lilith?.ChartPosition?.Ecliptic?.DecimalDegrees;

    if (lilithData) {
      const sign = getZodiacSign(lilithData);
      const isRetrograde = lilithData.isRetrograde;
      const position = formatPosition(lilithData);
      const house = findHouseForPlanet(lilithData, cuspsData);
      
      // Заменяем последний элемент в списке на Лилит
      if (planetPositionsList.length > 0) {
        planetPositionsList[planetPositionsList.length - 1] = { name: "lilith", isRetrograde, sign, position, house };
      } else {
        // Если список пуст, просто добавляем Лилит
        planetPositionsList.push({ name: "lilith", isRetrograde, sign, position, house });
      }
    }

    // Данные о Северном узле
    const nNode = horoscope.CelestialPoints.northnode?.ChartPosition?.Ecliptic?.DecimalDegrees;

    if (nNode) {
      const sign = getZodiacSign(nNode);
      const position = formatPosition(nNode);
      const house = findHouseForPlanet(nNode, cuspsData);
      const isRetrograde = nNode.isRetrograde;

      // Заменяем последний элемент в списке на NN
      if (planetPositionsList.length > 0) {
        planetPositionsList[planetPositionsList.length - 2] = { name: "northnode", isRetrograde, sign, position, house };
      } else {
        // Если список пуст, просто добавляем NN
        planetPositionsList.push({ name: "northnode", isRetrograde, sign, position, house });
      }
    }

    

    // Список значений для поля name
    const houseNames = [
      'Asc', 'II', 'III', 'IC', 'V', 'VI', 'Dsc', 'VIII', 'IX', 'MC', 'XI', 'XII'
    ];

    // Формируем данные для таблицы домов
    const housePositionsList = cuspsData
    .map((ecliptic: number, index: number) => {
      if (ecliptic == null) return null; // Проверка на null или undefined

      const sign = getZodiacSign(ecliptic);
      const position = formatPosition(ecliptic);

      // Сопоставляем значения для поля name с соответствующими значениями из houseNames
      const name = houseNames[index];

      return { name, position, sign };
    })
    .filter(Boolean); // Убираем null-значения

    setChartData(astroData);
    setPlanetPositions(planetPositionsList);
    if (housePositionsList.length > 0) {
      setHousePositions(housePositionsList);
    } else {
      console.error("Данные домов пустые или некорректные");
    }
    
    const aspectDataPlanet = getAspectsForPlanet(astroData);
    setAspectsData(aspectDataPlanet);

    console.log("planetPositionsList", planetPositionsList);
  
    const data = {
      planets: planetPositionsList,
      aspects: aspectDataPlanet,
    };

    setAspectPositions(data);
    setAspectsData(aspectDataPlanet);

  }, [birthData]);

  useEffect(() => {
    if (!chartData || !chartRef.current) return;
  
    const containerSize = chartRef.current.clientWidth;
    const chartSize = Math.min(containerSize, 800);
  
    chartRef.current.innerHTML = '';

    const settings = getStyleSettings(); // Получаем настройки в зависимости от стиля

    const chart = new Chart(chartRef.current.id, chartSize, chartSize, settings);
    const radix = chart.radix(chartData);
    const customAspects = createFormedAspects(aspectsData, chartData);
    radix.aspects(customAspects);
  }, [chartData]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-[800px]">
        <div id="chart-container" ref={chartRef} className="w-full aspect-square mb-6"></div>
      </div>
    </div>
  );
};

export default NatalChart;
