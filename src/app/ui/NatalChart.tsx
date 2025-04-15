'use client'

import { useEffect, useRef, useState } from 'react';
import Chart from '@astrodraw/astrochart';
import {HousePositionsList, NatalChartProps } from '../lib/definitions';
import { createFormedAspects, getNatalChart, getAspectsBetweenCharts, getCalendarData, 
  findExactAspectTime, getAspectsBetweenChartForecast, getNatalHouses, getSlowProgressionCalendar } from '../lib/utils';
import { div } from 'framer-motion/client';

const NatalChart: React.FC<NatalChartProps> = ({ 
  birthData, 
  setPlanetPositions, 
  setHousePositions, 
  setAspectPositions, 
  setLocalTime, 
  setLocalPlanetPositions, 
  setLocalHousePositions, 
  setLocalAspectPositions,
  activeTab, 
  setActiveTab,
  setCompPlanetPositions,
  setCompHousePositions,
  setCompAspectPositions, 
  setCompPairPositions,
  showPairPositions, 
  setShowPairPositions,
  setCalendarPositions,
  setIsDataLoaded
}) => {
  const chartRefMain = useRef<HTMLDivElement>(null);
  const chartRefLeft = useRef<HTMLDivElement>(null);
  const localChartRefRight = useRef<HTMLDivElement>(null);
  const localChartRefMobile = useRef<HTMLDivElement>(null);
  const chartRefMobile = useRef<HTMLDivElement>(null);

  const containerRefMain = useRef<HTMLDivElement | null>(null);
  const containerRefMobile = useRef<HTMLDivElement | null>(null);
  const containerRefDesk = useRef<HTMLDivElement | null>(null);
  
  const [chartData, setChartData] = useState<any>(null);
  const [aspectsData, setAspectsData] = useState<any>(null);

  const [localChartData, setLocalChartData] = useState<any>(null);
  const [localAspectsData, setLocalAspectsData] = useState<any>(null);

  const [compChartData, setCompChartData] = useState<any>(null);
  const [compAspectsData, setCompAspectsData] = useState<any>(null);

  const houseSystem = birthData.houseSystem || 'koch'; // Берём систему домов

  const [isLocal, setIsLocal] = useState(false);
  const [isCompatibility, setIsCompatibility] = useState(false);
  const [isFore, setIsFore] = useState(false);
  const [isForeSlow, setIsForeSlow] = useState(false);
  
  const [twoMaps, setTwoMaps] = useState(false);

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

  // Обработка формы ввода
  useEffect(() => {
    if (!birthData.date || !birthData.time || !birthData.latitude || !birthData.longitude) return;

    let isLocal;
    let isCompatibility;
    let isFore; 
    let isForeSlow; 

    if (birthData.isLocal){
      isLocal = true;
      setIsLocal(true);
    } 
    else {
      setIsLocal(false);
      isLocal = false;
    }

    if (birthData.isCompatibility){
      isCompatibility = true;
      setIsCompatibility(true);
    } else{
      isCompatibility = false;
      setIsCompatibility(false);
    }

    if (birthData.isFore){
      isFore = true;
      setIsFore(true);
    } else{
      isFore = false;
      setIsFore(false);
    }

    if (birthData.isForeSlow){
      isForeSlow = true;
      setIsForeSlow(true);
    } else{
      isForeSlow = false;
      setIsForeSlow(false);
    }

    console.log("isLocal", isLocal);
    console.log("isForeSlow", isForeSlow);
    console.log("birthData.isForeSlow", birthData.isForeSlow);

    const natalData = getNatalChart(birthData, false, false, false);
    if (natalData){
      setChartData(natalData.astroData);
      setPlanetPositions(natalData.planets);

      if (natalData.houses.length > 0) {
        setHousePositions(natalData.houses);
      } else {
        console.error("Данные домов локальной карты пустые или некорректные");
      }

      const data = {
        planets: natalData.planets,
        aspects: natalData.aspects,
      };

      setAspectPositions(data);
      setAspectsData(natalData.aspects);

    } 

    const utcTime = natalData?.utcTime?.slice(-6) || ""; 
    if (setLocalTime) {
      setLocalTime(utcTime);
    }

    let localData;
    if (isLocal){
      localData = getNatalChart(birthData, true, false, false); 

      if (localData){
        setLocalChartData(localData.astroData);
        setLocalPlanetPositions(localData.planets);

        if (localData.houses.length > 0) {
          setLocalHousePositions(localData.houses);
        } else {
          console.error("Данные домов локальной карты пустые или некорректные");
        }
  
        const data = {
          planets: localData.planets,
          aspects: localData.aspects,
        };
  
        setLocalAspectPositions(data);
        setLocalAspectsData(localData.aspects);
      } 
    }

    let compNatalData;
    if (isCompatibility){
      compNatalData = getNatalChart(birthData, false, true, false); 

      if (compNatalData && natalData){
        setCompChartData(compNatalData.astroData);
        setCompPlanetPositions(compNatalData.planets);

        if (compNatalData.houses.length > 0) {
          setCompHousePositions(compNatalData.houses);
        } else {
          console.error("Данные домов локальной карты пустые или некорректные");
        }
  
        let data = {
          planets: compNatalData.planets,
          aspects: compNatalData.aspects,
        };
  
        setCompAspectPositions(data);
        setCompAspectsData(compNatalData.aspects);

        const pairData = getAspectsBetweenCharts(natalData.astroData, compNatalData.astroData, false);
        data = {
          planets: compNatalData.planets,
          aspects: pairData,
        };
        setCompPairPositions(data);
      } 
    }

    let natalDataFore;
    if (isFore){
      if (isLocal) natalDataFore = getNatalChart(birthData, true, false, true); 
      else natalDataFore = getNatalChart(birthData, false, false, true); 
      let data;
      
      if (natalDataFore && natalData){
        
        setCompChartData(natalDataFore.astroData);
        setCompPlanetPositions(natalDataFore.planets);

        if (natalDataFore.houses.length > 0) {
          setCompHousePositions(natalDataFore.houses);
        } else {
          console.error("Данные домов локальной карты пустые или некорректные");
        }

        data = {
          planets: natalDataFore.planets,
          aspects: natalDataFore.aspects,
        };

        setCompAspectPositions(data);
        setCompAspectsData(natalDataFore.aspects);
        
        const pairData = getAspectsBetweenCharts(natalData.astroData, natalDataFore.astroData, false);

        data = {
          planets: natalDataFore.planets,
          aspects: pairData,
        };
        setCompPairPositions(data);

        const run = async () => {
          const calendarData = getCalendarData(birthData);
      
          const promises = [];
      
          for (const item of calendarData) {
            for (const aspect of item.aspects) {
              const promise = findExactAspectTime(natalData, birthData, aspect);
              promises.push(promise);
            }
          }
      
          const exactTime = await Promise.all(promises);
      
          const transitCalendar = {
            filteredResult: calendarData,
            exactTime: exactTime
          };
      
          setCalendarPositions(transitCalendar);
        };
      
        run(); 
      }  
    }

    let natalDataForeSlow;
    if (isForeSlow){
      if (isLocal) natalDataForeSlow = getNatalChart(birthData, true, false, true); 
      else natalDataForeSlow = getNatalChart(birthData, false, false, true); 
      let data;
      
      if (natalDataForeSlow && natalData){
        
        setCompChartData(natalDataForeSlow.astroData);
        setCompPlanetPositions(natalDataForeSlow.planets);

        if (natalDataForeSlow.houses.length > 0) {
          setCompHousePositions(natalDataForeSlow.houses);
        } else {
          console.error("Данные домов локальной карты пустые или некорректные");
        }

        data = {
          planets: natalDataForeSlow.planets,
          aspects: natalDataForeSlow.aspects,
        };

        setCompAspectPositions(data);
        setCompAspectsData(natalDataForeSlow.aspects);
        
        // const pairData = getAspectsBetweenCharts(natalData.astroData, natalDataForeSlow.astroData, false);

        let natalHouses = getNatalHouses(birthData, false, false, false);
        let natalForecastHouses;

        if (isLocal) natalForecastHouses = getNatalHouses(birthData, true, false, true);
        else natalForecastHouses = getNatalHouses(birthData, false, false, true);

        const pairData = getAspectsBetweenChartForecast(
          natalData.astroData,
          natalDataForeSlow.astroData,
          natalHouses,
          natalForecastHouses
        );

        data = {
          planets: natalDataForeSlow.planets,
          aspects: pairData,
        };
        setCompPairPositions(data);

        const run = async () => {
          const calendarData = getSlowProgressionCalendar(birthData);

          console.log("calendarData", calendarData);


          // const transitCalendar = {
          //   filteredResult: calendarData,
          //   exactTime: []
          // };
      
          setCalendarPositions(calendarData);

      
          // const promises = [];
      
          // for (const item of calendarData) {
          //   for (const aspect of item.aspects) {
          //     const promise = findExactAspectTime(natalData, birthData, aspect);
          //     promises.push(promise);
          //   }
          // }
      
          // const exactTime = await Promise.all(promises);
      
          // const transitCalendar = {
          //   filteredResult: calendarData,
          //   exactTime: exactTime
          // };
      
          // setCalendarPositions(transitCalendar);
        };
      
        run(); 
      }  
    }
  }, [birthData]);


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
    if (!isLocal && !isCompatibility || !chartData || !containerRefMobile.current || !chartRefMobile.current) return;

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
    if (!isLocal && !isCompatibility || !chartData || !containerRefDesk.current || !chartRefLeft.current) return;

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

  //Рисуем радикс для мобильной версии карты совместимости
  useEffect(() => {
    if (!compChartData || isLocal || !localChartRefMobile.current || !containerRefMobile.current) return;

    const settings = getStyleSettings();
    const localCustomAspects = createFormedAspects(compAspectsData, compChartData);

    
    const containerSizeMobile = containerRefMobile.current.clientWidth || 700;
    const chartSizeModile = Math.min(containerSizeMobile, 800);

    localChartRefMobile.current.innerHTML = "";
    const chartModile = new Chart(localChartRefMobile.current.id, chartSizeModile, chartSizeModile, settings);
    const radixModile = chartModile.radix(compChartData);
    radixModile.aspects(localCustomAspects);

  }, [compChartData]);

  //Рисуем радикс для настольной версии карты совместимости
  useEffect(() => {
    if (!compChartData || isLocal || !containerRefDesk.current || !localChartRefRight.current) return;
    const settings = getStyleSettings();
    const localCustomAspects = createFormedAspects(compAspectsData, compChartData);

    
    const containerSize = containerRefDesk.current.clientWidth * 2 || 700;
    const chartSize = Math.min(containerSize, 800);
    localChartRefRight.current.innerHTML = "";
    const chart = new Chart(localChartRefRight.current.id, chartSize, chartSize, settings);
    const radix = chart.radix(compChartData);
    radix.aspects(localCustomAspects);

  }, [compChartData]);

  return (
    <div className="flex flex-col items-center w-full" ref={containerRefMobile}>
      {/* Локальная карта для небольших экранов */}
      {(isLocal || isCompatibility || isFore || isForeSlow) &&
        <div>
          {/* Табы */}
          {(isLocal || isCompatibility || isFore || isForeSlow) && 
            <div className="flex space-x-4 justify-center">
              <button
                className={`px-4 py-2 rounded ${activeTab === "chart1" ? "bg-[#172935] text-white" : "bg-gray-200"}`}
                onClick={() => setActiveTab("chart1")}
              >
                {isCompatibility? "1 карта": "Натал"}
              </button>
              {(isLocal || isCompatibility) && 
                <>
                  <button
                    className={`px-4 py-2 rounded ${activeTab === "chart2" ? "bg-[#172935] text-white" : "bg-gray-200"}`}
                    onClick={() => setActiveTab("chart2")}
                  >
                    {isCompatibility? "2 карта": "Локал"}
                  </button>
                  <button
                    className={`px-4 py-2 hidden 2xl:flex  ${twoMaps ? "bg-[#172935] text-white rounded" : "rounded bg-gray-200"}`}
                    onClick={()=>{setTwoMaps(!twoMaps)}}
                  >
                    2 карты
                  </button>
                </>
              }
              {(isCompatibility || isFore || isForeSlow) &&
                <button
                  className={`px-4 py-2 ${showPairPositions ? "bg-[#172935] text-white rounded" : "rounded bg-gray-200"}`}
                  onClick={()=>{setShowPairPositions(!showPairPositions)}}
                >
                  {(isFore || isForeSlow) ? "Прогноз": "Аспекты"}
                </button>
              }
            </div>
          }
          {/* Контейнеры с изображениями */}
          <div className={`${twoMaps || showPairPositions ? "hidden" : ""}`}>
            { (isLocal || isCompatibility) &&
              <div className={`w-full max-w-[800px]}`} style={{ display: activeTab === "chart1" ? "block" : "none" }}>
                <div
                  id="chart-container-mobile"
                  ref={chartRefMobile}
                  className="w-full aspect-square flex items-center justify-center"
                />
              </div>
            }
            {(isLocal || isCompatibility) &&
              <div className={`w-full max-w-[800px] ${twoMaps ? "hidden" : ""}`} style={{ display: activeTab === "chart2" ? "block" : "none" }}>
                <div
                  id="local-chart-container-mobile"
                  ref={localChartRefMobile}
                  className="w-full aspect-square flex items-center justify-center"
                />
              </div>
            }
          </div>
        </div> 
      }

      {/* Локальная карта для больших экранов */}
      {(isLocal || isCompatibility) &&
        <div className={`hidden ${twoMaps && !showPairPositions ? "2xl:flex" : ""} `}>
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

      {/* Натальная карта по умолчанию */}
      {!isLocal && !isCompatibility &&
        <div ref={containerRefMain} className={` ${showPairPositions ? "hidden" : ""} w-full max-w-[800px]`}>
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
