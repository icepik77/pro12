'use client'

import { useEffect, useRef, useState } from 'react';
import Chart from '@astrodraw/astrochart';
import { Origin, Horoscope } from 'circular-natal-horoscope-js';
import { AstroData, NatalChartProps } from '../lib/definitions';
import { formatPosition, getZodiacSign, findHouseForPlanet, createFormedAspects, getAspectsForPlanet, convertToUTC, getUTCFromOrigin, setKochCusps } from '../lib/utils';
import { div } from 'framer-motion/client';

const NatalChart: React.FC<NatalChartProps> = ({ birthData, setPlanetPositions, setHousePositions, setAspectPositions, setLocalTime, setLocalPlanetPositions, setLocalHousePositions, setLocalAspectPositions, activeTab, setActiveTab }) => {
  
  const [chartData, setChartData] = useState<any>(null);
  const [aspectsData, setAspectsData] = useState<any>(null);

  const chartRefMain = useRef<HTMLDivElement>(null);
  const chartRefLeft = useRef<HTMLDivElement>(null);
  const localChartRefRight = useRef<HTMLDivElement>(null);
  const localChartRefMobile = useRef<HTMLDivElement>(null);
  const chartRefMobile = useRef<HTMLDivElement>(null);
  
  

  const [localChartData, setLocalChartData] = useState<any>(null);
  const [localAspectsData, setLocalAspectsData] = useState<any>(null);

  const containerRefMain = useRef<HTMLDivElement | null>(null);
  const containerRefMobile = useRef<HTMLDivElement | null>(null);
  const containerRefDesk = useRef<HTMLDivElement | null>(null);
  

  const houseSystem = birthData.houseSystem || 'koch'; // Берём систему домов
  const [isLocal, setIsLocal] = useState(false);


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
        SHIFT_IN_DEGREES: 180,
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
    const utcOffset = birthData.utcOffset;
    const latitude = parseFloat(birthData.latitude);
    const longitude = parseFloat(birthData.longitude);
    const handleUTCDate = utcOffset ? convertToUTC(birthData.date, birthData.time, utcOffset) : undefined;

   
    const localLatitude = parseFloat(birthData.localLatitude);
    const localLongitude = parseFloat(birthData.localLongitude);

    let isLocal = false;
    setIsLocal(false);
    if (localLatitude && localLongitude && birthData.isLocal){
      
      isLocal = true;
      setIsLocal(true);
    } 

    if (isNaN(latitude) || isNaN(longitude)) {
      console.error("Некорректные координаты:", latitude, longitude);
      return;
    }

    const customOrbs = {
      conjunction: 10,
      opposition: 8,
      trine: 6,
      square: 7,
      sextile: 5,
      quincunx: 5,
      quintile: 1,
      septile: 1,
      "semi-square": 1,
      "semi-sextile": 1,
    };

    const origin = new Origin({
      year,
      month: month - 1, // В JS месяцы с 0
      date: day,
      hour,
      minute,
      second,
      latitude,
      longitude,
      handleUTCDate
    });
    const horoscope = new Horoscope({
      origin,
      houseSystem: houseSystem,
      zodiac: 'tropical',
      aspectPoints: ['bodies', 'points'],
      aspectWithPoints: ['bodies', 'points'],
      aspectTypes: ['major'],
      customOrbs: customOrbs,
      language: 'en',
    });

    // Определяем локальный гороскоп
    let localOrigin;
    let localHoroscope;
    if (isLocal){
      let formattedDate = birthData.date;
      let formattedTime = birthData.time;
      let utc;

      if (handleUTCDate){
        // formattedDate = `${handleUTCDate.date}.${String(handleUTCDate.month).padStart(2, '0')}.${String(handleUTCDate.year).padStart(2, '0')}`;
        // formattedTime = `${String(handleUTCDate.hour).padStart(2, '0')}:${String(handleUTCDate.minute).padStart(2, '0')}:${String(handleUTCDate.second).padStart(2, '0')}`;
        utc = utcOffset;
      } 
      else utc = getUTCFromOrigin(latitude, longitude);

      const handleUTCDateLocal = convertToUTC(formattedDate, formattedTime, utc);

      localOrigin = new Origin({
        year,
        month: month - 1, // В JS месяцы с 0
        date: day,
        hour,
        minute,
        second,
        latitude: localLatitude,
        longitude: localLongitude,
        handleUTCDate: handleUTCDateLocal
      });

      localHoroscope = new Horoscope({
        origin: localOrigin,
        houseSystem: houseSystem,
        zodiac: 'tropical',
        aspectPoints: ['bodies', 'points'],
        aspectWithPoints: ['bodies', 'points'],
        aspectTypes: ['major'],
        customOrbs: customOrbs,
        language: 'en',
      });
    }

    const planetsData = horoscope.CelestialBodies;
    let cuspsData = horoscope.Houses.map((house: any) => house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees);
    const ascendant = horoscope._ascendant.ChartPosition.Ecliptic.DecimalDegrees;

    let localPlanetsData;
    let localCuspsData: number[] | null | undefined = null;
    let localAscendant: number | null = null;
    // Определяем небесные тела для локальной карты
    if (isLocal && localHoroscope){
      localPlanetsData = localHoroscope.CelestialBodies;
      localCuspsData = localHoroscope.Houses.map((house: any) => house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees);
      localAscendant = localHoroscope._ascendant.ChartPosition.Ecliptic.DecimalDegrees
    }
    
    // Правильный расчет домов для системы Коха
    if (horoscope._houseSystem == "koch") {
      cuspsData = setKochCusps(ascendant, cuspsData);

      if (isLocal && localAscendant) {
        localCuspsData = setKochCusps(localAscendant, localCuspsData);
      }
    }

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

    let localAstroData: AstroData | null = null; 
    if (isLocal && localCuspsData) {
      localAstroData = { // Убираем `: AstroData =`, т.к. тип уже указан
        planets: {
          "Sun": [localPlanetsData.sun.ChartPosition.Ecliptic.DecimalDegrees || 0],
          "Moon": [localPlanetsData.moon.ChartPosition.Ecliptic.DecimalDegrees || 0],
          "Mercury": [localPlanetsData.mercury.ChartPosition.Ecliptic.DecimalDegrees || 0],
          "Venus": [localPlanetsData.venus.ChartPosition.Ecliptic.DecimalDegrees || 0],
          "Mars": [localPlanetsData.mars.ChartPosition.Ecliptic.DecimalDegrees || 0],
          "Jupiter": [localPlanetsData.jupiter.ChartPosition.Ecliptic.DecimalDegrees || 0],
          "Saturn": [localPlanetsData.saturn.ChartPosition.Ecliptic.DecimalDegrees || 0],
          "Uranus": [localPlanetsData.uranus.ChartPosition.Ecliptic.DecimalDegrees || 0],
          "Neptune": [localPlanetsData.neptune.ChartPosition.Ecliptic.DecimalDegrees || 0],
          "Pluto": [localPlanetsData.pluto.ChartPosition.Ecliptic.DecimalDegrees || 0],
          "Lilith": [localHoroscope?.CelestialPoints.lilith.ChartPosition.Ecliptic.DecimalDegrees || 0],
          "NNode": [localHoroscope?.CelestialPoints.northnode.ChartPosition.Ecliptic.DecimalDegrees || 0],
        },
        cusps: localCuspsData,
      };
    }

    const utcTime = origin.localTimeFormatted?.slice(-6) || ""; 
    if (setLocalTime) {
      setLocalTime(utcTime);
    }

    // Формируем данные для таблицы планет
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
    const data = {
      planets: planetPositionsList,
      aspects: aspectDataPlanet,
    };
    setAspectPositions(data);
    setAspectsData(aspectDataPlanet);

    //Создаем таблицы для локальной карты
    let localPlanetPositionsList;
    let localLilithData;
    let localNNode;
    let localHousePositionsList;
    if (isLocal && localCuspsData && localHoroscope){
      // Формируем данные для таблицы планет, локальная
      localPlanetPositionsList = Object.entries(localPlanetsData)
      .map(([key, planet]: any) => {
        if (!planet?.ChartPosition?.Ecliptic?.DecimalDegrees) return null;

        const ecliptic = planet.ChartPosition.Ecliptic.DecimalDegrees;
        const isRetrograde = planet.isRetrograde;
        const sign = getZodiacSign(ecliptic);
        const position = formatPosition(ecliptic);
        const house = findHouseForPlanet(ecliptic, localCuspsData);

        return { name: key, isRetrograde, sign, position, house };
      })
      .filter(Boolean); // Убираем null-значения
      // Данные о Лилит
      localLilithData = localHoroscope.CelestialPoints.lilith?.ChartPosition?.Ecliptic?.DecimalDegrees;
      if (localLilithData) {
        const sign = getZodiacSign(localLilithData);
        const isRetrograde = localLilithData.isRetrograde;
        const position = formatPosition(localLilithData);
        const house = findHouseForPlanet(localLilithData, localCuspsData);
        
        // Заменяем последний элемент в списке на Лилит
        if (localPlanetPositionsList.length > 0) {
          localPlanetPositionsList[localPlanetPositionsList.length - 1] = { name: "lilith", isRetrograde, sign, position, house };
        } else {
          // Если список пуст, просто добавляем Лилит
          localPlanetPositionsList.push({ name: "lilith", isRetrograde, sign, position, house });
        }
      }
      // Данные о Северном узле
      localNNode = localHoroscope.CelestialPoints.northnode?.ChartPosition?.Ecliptic?.DecimalDegrees;
      if (localNNode) {
        const sign = getZodiacSign(localNNode);
        const position = formatPosition(localNNode);
        const house = findHouseForPlanet(localNNode, localCuspsData);
        const isRetrograde = localNNode.isRetrograde;

        // Заменяем последний элемент в списке на NN
        if (localPlanetPositionsList.length > 0) {
          localPlanetPositionsList[localPlanetPositionsList.length - 2] = { name: "northnode", isRetrograde, sign, position, house };
        } else {
          // Если список пуст, просто добавляем NN
          localPlanetPositionsList.push({ name: "northnode", isRetrograde, sign, position, house });
        }
      }

      // Список значений для поля name
      const houseNames = [
        'Asc', 'II', 'III', 'IC', 'V', 'VI', 'Dsc', 'VIII', 'IX', 'MC', 'XI', 'XII'
      ];
      // Формируем данные для таблицы домов
      localHousePositionsList = localCuspsData
      .map((ecliptic: number, index: number) => {
        if (ecliptic == null) return null; // Проверка на null или undefined

        const sign = getZodiacSign(ecliptic);
        const position = formatPosition(ecliptic);

        // Сопоставляем значения для поля name с соответствующими значениями из houseNames
        const name = houseNames[index];

        return { name, position, sign };
      })
      .filter(Boolean); // Убираем null-значения

      setLocalChartData(localAstroData);
      setLocalPlanetPositions(localPlanetPositionsList);
      if (localHousePositionsList.length > 0) {
        setLocalHousePositions(localHousePositionsList);
      } else {
        console.error("Данные домов локальной карты пустые или некорректные");
      }

      const localAspectDataPlanet = localAstroData ? getAspectsForPlanet(localAstroData) : null;
      if (localAspectDataPlanet) setLocalAspectsData(localAspectDataPlanet);

      const data = {
        planets: localPlanetPositionsList,
        aspects: localAspectDataPlanet,
      };

      setLocalAspectPositions(data);
      setLocalAspectsData(localAspectDataPlanet);

    }
  }, [birthData]);

  useEffect(() => {
    console.log("localChartDataSimple", localChartData);
  });

  // Рисуем радикс натала по дефолту
  useEffect(() => {
    if (isLocal || !chartData || !chartRefMain.current || !containerRefMain.current) return;

    const settings = getStyleSettings();
    const customAspects = createFormedAspects(aspectsData, chartData);

    
    const containerSizeMain = containerRefMain.current.clientWidth; // Размер родительского контейнера
    const chartSizeMain = Math.min(containerSizeMain, 800);
    chartRefMain.current.innerHTML = "";
    const chartMain = new Chart(chartRefMain.current.id, chartSizeMain, chartSizeMain, settings);
    const radixMain = chartMain.radix(chartData);
    radixMain.aspects(customAspects);

  }, [chartData]);

  //Рисуем радикс натала для мобильной версии
  useEffect(() => {
    if (!isLocal || !chartData || !containerRefMobile.current || !chartRefMobile.current) return;

    const settings = getStyleSettings();
    const customAspects = createFormedAspects(aspectsData, chartData);

    
    const containerSizeMobile = containerRefMobile.current.clientWidth; // Размер родительского контейнера
    const chartSizeMobile = Math.min(containerSizeMobile, 800);
    chartRefMobile.current.innerHTML = "";
    const chartMobile = new Chart(chartRefMobile.current.id, chartSizeMobile, chartSizeMobile, settings);
    const radixMobile = chartMobile.radix(chartData);
    radixMobile.aspects(customAspects);

  }, [chartData]);

  //Рисуем радикс натала для большого экрана
  useEffect(() => {
    if (!isLocal || !chartData || !containerRefDesk.current || !chartRefLeft.current) return;

    const settings = getStyleSettings();
    const customAspects = createFormedAspects(aspectsData, chartData);

    
    const containerSizeDesk = containerRefDesk.current.clientWidth || 700; // Размер родительского контейнера
    const chartSizeDesk = Math.min(containerSizeDesk, 800);
    chartRefLeft.current.innerHTML = "";
    const chartLeft = new Chart(chartRefLeft.current.id, chartSizeDesk, chartSizeDesk, settings);
    const radixLeft = chartLeft.radix(chartData);
    radixLeft.aspects(customAspects);

  }, [chartData]);
  
  //Рисуем радикс для мобильной версии локальной карты
  useEffect(() => {
    if (!localChartData || !localChartRefMobile.current || !containerRefMobile.current) return;

    console.log("localChartData", localChartData);

    const settings = getStyleSettings();
    const localCustomAspects = createFormedAspects(aspectsData, localChartData);

    
    const containerSizeMobile = containerRefMobile.current.clientWidth || 700;
    const chartSizeModile = Math.min(containerSizeMobile, 800);

    localChartRefMobile.current.innerHTML = "";
    const chartModile = new Chart(localChartRefMobile.current.id, chartSizeModile, chartSizeModile, settings);
    const radixModile = chartModile.radix(localChartData);
    radixModile.aspects(localCustomAspects);

  }, [localChartData]);

  //Рисуем радикс для настольной версии локальной карты
  useEffect(() => {
    if (!localChartData || !containerRefDesk.current || !localChartRefRight.current) return;
    const settings = getStyleSettings();
    const localCustomAspects = createFormedAspects(aspectsData, localChartData);

    
    const containerSize = containerRefDesk.current.clientWidth * 2 || 700;
    const chartSize = Math.min(containerSize, 800);
    localChartRefRight.current.innerHTML = "";
    const chart = new Chart(localChartRefRight.current.id, chartSize, chartSize, settings);
    const radix = chart.radix(localChartData);
    radix.aspects(localCustomAspects);

  }, [localChartData]);

  return (
    <div className="flex flex-col items-center w-full" ref={containerRefMobile}>
      {/* Локальная карта для больших экранов */}
      {isLocal && 
        <div className='hidden 2xl:flex'>
          <div ref={containerRefDesk} className="w-1/2 max-w-[800px]">
            <div
              id="chart-container-left"
              ref={chartRefLeft}
              className="w-full aspect-square flex items-center justify-center"
            />
          </div>
          <div ref={containerRefDesk} className="w-1/2 max-w-[800px]">
            <div
              id="local-chart-container"
              ref={localChartRefRight}
              className="w-full aspect-square flex items-center justify-center"
            />
          </div>
        </div>
      }

      {/* Локальная карта для небольших экранов */}
      {isLocal &&
        <div className='2xl:hidden'>
          {/* Табы */}
          {isLocal && 
            <div className="flex space-x-4 justify-center">
              <button
                className={`px-4 py-2 rounded ${activeTab === "chart1" ? "bg-[#172935] text-white" : "bg-gray-200"}`}
                onClick={() => setActiveTab("chart1")}
              >
                Натал
              </button>
              <button
                className={`px-4 py-2 rounded ${activeTab === "chart2" ? "bg-[#172935] text-white" : "bg-gray-200"}`}
                onClick={() => setActiveTab("chart2")}
              >
                Локал
              </button>
            </div>
          }
          {/* Контейнеры с изображениями */}
          <div className="w-full max-w-[800px]" style={{ display: activeTab === "chart1" ? "block" : "none" }}>
            <div
              id="chart-container-mobile"
              ref={chartRefMobile}
              className="w-full aspect-square flex items-center justify-center"
            />
          </div>
          {isLocal &&
            <div className="w-full max-w-[800px]" style={{ display: activeTab === "chart2" ? "block" : "none" }}>
              <div
                id="local-chart-container-mobile"
                ref={localChartRefMobile}
                className="w-full aspect-square flex items-center justify-center"
              />
            </div>
          }

        </div> 
      }

      {/* Натальная карта без локальной */}
      {!isLocal && 
        <div ref={containerRefMain} className="w-full max-w-[800px]">
          <div
            id="chart-container-main"
            ref={chartRefMain}
            className="w-full aspect-square flex items-center justify-center"
          />
        </div>
      }

      

      
      

      
    </div>
  );
};

export default NatalChart;
