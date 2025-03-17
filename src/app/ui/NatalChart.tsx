'use client'

import { useEffect, useRef, useState } from 'react';
import Chart from '@astrodraw/astrochart';
import { Origin, Horoscope } from 'circular-natal-horoscope-js';
import {NatalChartProps } from '../lib/definitions';
import { formatPosition, getZodiacSign, findHouseForPlanet, createFormedAspects } from '../lib/utils';


const NatalChart: React.FC<NatalChartProps> = ({ birthData, setPlanetPositions, setHousePositions, setAspectPositions }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [aspectsData, setAspectsData] = useState<any>(null);
  const houseSystem = birthData.houseSystem || 'koch'; // Берём систему домов

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
      !item.point2Key.toLowerCase().includes('southnode') && 
      !item.point2Key.toLowerCase().includes('sirius')
    );;

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

    console.log("Данные о аспектах", horoscope.Aspects);

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
    setAspectsData(aspectsData);
    setAspectPositions(aspectsData);

  }, [birthData]);

  useEffect(() => {
    if (!chartData || !chartRef.current) return;
  
    const containerSize = chartRef.current.clientWidth;
    const chartSize = Math.min(containerSize, 800);
  
    chartRef.current.innerHTML = '';

    var settings = {
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
