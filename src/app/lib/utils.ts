import { AstroData, Aspect, BirthData, PlanetPositionList } from "./definitions";
import { Origin, Horoscope } from "circular-natal-horoscope-js";

type AspectWithTimestamp = Aspect & { timestamp: Date, orb: number };

export const formatPosition = (decimalDegrees: number) => {
  const degreesInSign = decimalDegrees % 30; // Ограничиваем до 30 градусов
  const degrees = Math.floor(degreesInSign);
  const minutes = Math.floor((degreesInSign - degrees) * 60);
  const seconds = Math.floor(((degreesInSign - degrees) * 60 - minutes) * 60);
  return `${degrees}° ${minutes}′ ${seconds}″`;
};

export const getZodiacSign = (decimalDegrees: number) => {
  const zodiacSigns: string[] = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const index = Math.floor(decimalDegrees / 30) % 12;
  return zodiacSigns[index];
};

export const findHouseForPlanet = (decimalDegrees: number, cuspsData: any) => {
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

export const createFormedAspects = (aspectsArray : any[], astroData: AstroData) => {

  return aspectsArray.map((aspect) => {
    const pointPosition = astroData.planets[aspect.point1Label.charAt(0).toUpperCase() + aspect.point1Label.slice(1)]?.[0] || 0;
    const toPointPosition = astroData.planets[aspect.point2Label.charAt(0).toUpperCase() + aspect.point2Label.slice(1)]?.[0] || 0;


    return {
      point: {
        name: aspect.point1Label,
        position: pointPosition
      },
      toPoint: {
        name: aspect.point2Label,
        position: toPointPosition
      },
      aspect: {
        name: aspect.aspectKey,
        degree: aspect.orb,  // Используем orb для угла аспекта
        color: getColorForAspect(aspect.aspectKey),
        orbit: aspect.orbUsed
      },
      precision: "exact"
    };
  });
}

export const getColorForAspect = (aspectKey: string): string => {
  const positiveAspects = ["trine", "sextile"]; // Гармоничные аспекты (зеленый)
  const negativeAspects = ["conjunction", "square", "opposition"]; // Напряженные аспекты (красный)

  if (positiveAspects.includes(aspectKey)) return "#006400"; // Зеленый
  if (negativeAspects.includes(aspectKey)) return "#B22222"; // Красный

  return "#FFFFFF"; // Если аспект неизвестен, используем белый
};

export const formatUtcOffset = (offset: number) => {
  const hours = Math.floor(offset);
  const minutes = Math.abs((offset % 1) * 60);
  return `UTC${hours >= 0 ? "+" : ""}${hours}:${minutes.toFixed(0).padStart(2, "0")}`;
};

export const getAspectsForPlanet = (astroData: AstroData) => {
  
  const aspects = {
    conjunction: 0,
    opposition: 180,
    trine: 120,
    square: 90,
    sextile: 60,
  };

  const orbs = {
    Sun: 8.5,
    Moon: 8.5,
    Mercury: 8.5,
    Venus: 8.5,
    Mars: 8.5,
    Jupiter: 8.5,
    Saturn: 9,
    Uranus: 8.5,
    Neptune: 6.5,
    Pluto: 6.5,
    Lilith: 8.5,
    NNode: 8.5,
  };
  
  let foundAspects: Aspect[] = [];

  // Преобразуем объект `astroData.planets` в массив объектов
  const planetsArray = Object.entries(astroData.planets).map(([name, position]) => ({
    name: name,
    position: position[0], // Берём первое значение из массива
  }));

  planetsArray.forEach((planetA, indexA) => {
    planetsArray.forEach((planetB, indexB) => {
      if (indexA >= indexB) return;

      const degreeA = (planetA.position);
      const degreeB = (planetB.position);

      const diff = Math.abs(degreeA - degreeB);
      const adjustedDiff = Math.min(diff, 360 - diff);

      Object.entries(aspects).forEach(([aspect, aspectDegree]) => {
        const orbA = orbs[planetA.name as keyof typeof orbs] || 5;
        const orbB = orbs[planetB.name as keyof typeof orbs] || 5;
        const maxOrb = Math.min(orbA, orbB);
        const aspectDiff = Math.abs(adjustedDiff - aspectDegree); // Насколько отклонение от точного аспекта

        if (aspectDiff <= maxOrb) {
          foundAspects.push({
            point1Key: planetA.name,
            point2Key: planetB.name,
            aspectKey: aspect,
            orb: aspectDiff, // Сохраняем точное отклонение
            point1Label: planetA.name,
            point2Label: planetB.name,
          });
        }
      });
    });
  });
  return foundAspects;
};

export const shouldMod180 = (prevCusp : number, currentCusp : number) => {
  // ** NOTE ** the calculated houses may require a 180 degree correction
  // used in Monk house systems (Placidus, Regiomontanus, etc)
  // all values are mod360ed
  if (currentCusp < prevCusp) {
    // For instances when prev = 350 and current = 20
    // But not when prev = 250 and current = 100 (280)
    if (Math.abs(currentCusp - prevCusp) >= 180) return false;
    return true;
  } if (prevCusp < currentCusp) {
    if (currentCusp - prevCusp < 180) return false;
    return true;
  }
};

export const modulo = (n: number, m: number): number => {
  return ((n % m) + m) % m;
}

export const validateDateTimeUTC = (handleDate: string, handleTime: string, utc: string) => {
  const [day, month, year] = handleDate.split(".").map(Number);
  const [hours, minutes, seconds = 0] = handleTime.split(":").map(Number);
  const [hoursUTC, minutesUTC] = utc.slice(1).split(":").map(Number);

  if (hoursUTC > 12 || minutesUTC > 59) {
    console.log("Ошибка ввода часового пояса");
    return false;
  }


  // Проверка на корректность месяца (1-12)
  if (month < 1 || month > 12) {
    console.log("Некорректный месяц");
    return false;
  }

  // Проверка на корректность дня (1-31 в зависимости от месяца)
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    console.log("Некорректный день");
    return false;
  }

  // Проверка на корректность времени
  if (hours < 0 || hours > 23) {
    console.log("Некорректные часы");
    return false;
  }

  if (minutes < 0 || minutes > 59) {
    console.log("Некорректные минуты");
    return false;
  }

  if (seconds < 0 || seconds > 59) {
    console.log("Некорректные секунды");
    return false;
  }

  const date = new Date(year, month - 1, day, hours, minutes, seconds);

  if (year >= 2100 || year <= 1800) return false;

  return !isNaN(date.getTime()); // Проверяет, является ли дата валидной
};

export const convertToUTC = (dateString: string, localTime: string, timezoneOffsetStr: string) => {

  // Разбираем строку часового пояса (чч:мм)
  let sign = timezoneOffsetStr.startsWith('-') ? -1 : 1;
  let [hoursUTC, minutesUTC] = timezoneOffsetStr.slice(1).split(':').map(Number);
  let [hours, minutes, seconds = 0] = localTime.split(':').map(Number);
  let [day, month, year] = dateString.split('.').map(Number);
  let timezoneOffset = sign * (hoursUTC * 60 + minutesUTC); // Переводим в минуты

  let formattedDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Создаем объект локальной даты
  let localDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

  // Переводим в UTC
  let utcDate = new Date(localDate.getTime() - timezoneOffset * 60 * 1000);

  // Возвращаем объект с годом, месяцем и т.д.
  return {
      year: utcDate.getUTCFullYear(),
      month: utcDate.getUTCMonth() + 1, // В JS месяцы с 0 (январь) до 11 (декабрь)
      date: utcDate.getUTCDate(),
      hour: utcDate.getUTCHours(),
      minute: utcDate.getUTCMinutes(),
      second: utcDate.getUTCSeconds(),
  };
}

export const getUTCFromOrigin = (latitude : number, longitude : number) =>{

  const now = new Date(); // Получаем текущую дату и время в UTC

  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1; // Исправляем индексацию месяца (1-12)
  const date = now.getUTCDate();
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();
  const second = now.getUTCSeconds();
  const handleUTCDate = undefined;

  const origin = new Origin({
    year,
    month: month - 1, // В JS месяцы с 0
    date,
    hour,
    minute,
    second,
    latitude,
    longitude,
    handleUTCDate
  });

  return origin.localTimeFormatted?.slice(-6); 
}

export const setKochCusps = (ascendant: number, cuspsData : any) =>{
  
  if (!Array.isArray(cuspsData) || cuspsData.length < 12) {
    throw new Error("Invalid cuspsData: expected an array with at least 12 elements.");
  }

  if (ascendant >= 180) {
    const firstCusp = cuspsData[0];
    const secondCusp = shouldMod180(firstCusp, cuspsData[1]) ? modulo(cuspsData[1] + 180, 360) : cuspsData[1];
    const thirdCusp = shouldMod180(firstCusp, cuspsData[2]) ? modulo(cuspsData[2] + 180, 360) : cuspsData[2];
    const fourthCusp = shouldMod180(firstCusp, cuspsData[3]) ? modulo(cuspsData[3] + 180, 360) : cuspsData[3];
    const fifthCusp = shouldMod180(firstCusp, cuspsData[4]) ? modulo(cuspsData[4] + 180, 360) : cuspsData[4];
    const sixthCusp = shouldMod180(firstCusp, cuspsData[5]) ? modulo(cuspsData[5] + 180, 360) : cuspsData[5];
    const seventhCusp = modulo(firstCusp + 180, 360);
    const eighthCusp = shouldMod180(seventhCusp, cuspsData[7] ) ? modulo(cuspsData[7] + 180, 360) : cuspsData[7];
    const ninthCusp = shouldMod180(seventhCusp, cuspsData[8]) ? modulo(cuspsData[8] + 180, 360) : cuspsData[8];
    const tenthCusp = shouldMod180(seventhCusp, cuspsData[9]) ? modulo(cuspsData[9] + 180, 360) : cuspsData[9];
    const eleventhCusp = shouldMod180(seventhCusp, cuspsData[10]) ? modulo(cuspsData[10] + 180, 360) : cuspsData[10];
    const twelfthCusp = shouldMod180(seventhCusp, cuspsData[11]) ? modulo(cuspsData[11] + 180, 360) : cuspsData[11];

    const firstCusp1 =  seventhCusp;
    const secondCusp1 = eighthCusp;
    const thirdCusp1 = ninthCusp;
    const fourthCusp1 = tenthCusp;
    const fifthCusp1 = eleventhCusp;
    const sixthCusp1 = twelfthCusp;
    const seventhCusp1 = firstCusp;
    const eighthCusp1 = secondCusp;
    const ninthCusp1 = thirdCusp;
    const tenthCusp1 = fourthCusp;
    const eleventhCusp1 = fifthCusp;
    const twelfthCusp1 = sixthCusp;
    
    const arr = [
      firstCusp1.toFixed(4), secondCusp1.toFixed(4), thirdCusp1.toFixed(4), fourthCusp1.toFixed(4), fifthCusp1.toFixed(4), sixthCusp1.toFixed(4),
      seventhCusp1.toFixed(4), eighthCusp1.toFixed(4), ninthCusp1.toFixed(4), tenthCusp1.toFixed(4), eleventhCusp1.toFixed(4), twelfthCusp1.toFixed(4),
    ];

    return arr.map(Number);
  }

  return cuspsData;
}

export const getAspectsBetweenCharts = (astroData1: AstroData, astroData2: AstroData, orbisNUll: boolean) => { 
  const aspects = {
    conjunction: 0,
    opposition: 180,
    trine: 120,
    square: 90,
    sextile: 60,
  };

  let orbs;
  if (!orbisNUll){
    orbs = {
      Sun: 8.5,
      Moon: 8.5,
      Mercury: 8.5,
      Venus: 8.5,
      Mars: 8.5,
      Jupiter: 8.5,
      Saturn: 9,
      Uranus: 8.5,
      Neptune: 6.5,
      Pluto: 6.5,
      Lilith: 8.5,
      NNode: 8.5,
    };
  } else{
    orbs = {
      Sun: 0.08,
      Moon: 0.5,
      Mercury: 0.08,
      Venus: 0.08,
      Mars: 0.08,
      Jupiter: 0.08,
      Saturn: 0.08,
      Uranus: 0.08,
      Neptune: 0.08,
      Pluto: 0.08,
      Lilith: 0.5,
      NNode: 0.5,
    };
  }
  
  let foundAspects: Aspect[] = [];

  // Преобразуем объекты планет в массивы
  const planetsArray1 = Object.entries(astroData1.planets).map(([name, position]) => ({
    name,
    position: position[0],
  }));

  const planetsArray2 = Object.entries(astroData2.planets).map(([name, position]) => ({
    name,
    position: position[0],
  }));

  planetsArray1.forEach((planetA) => {
    planetsArray2.forEach((planetB) => {
      const degreeA = planetA.position;
      const degreeB = planetB.position;

      const diff = Math.abs(degreeA - degreeB);
      const adjustedDiff = Math.min(diff, 360 - diff);

      Object.entries(aspects).forEach(([aspect, aspectDegree]) => {
        const orbA = orbs[planetA.name as keyof typeof orbs]
        const orbB = orbs[planetB.name as keyof typeof orbs]
        let maxOrb;
        if (orbisNUll) maxOrb = Math.max(orbA, orbB);
        else maxOrb = Math.min(orbA, orbB);
         
        const aspectDiff = Math.abs(adjustedDiff - aspectDegree);

        if (aspectDiff <= maxOrb) {
          foundAspects.push({
            point1Key: planetA.name,
            point2Key: planetB.name,
            aspectKey: aspect,
            orb: aspectDiff,
            point1Label: planetA.name,
            point2Label: planetB.name,
          });
        }
      });
    });
  });

  return foundAspects;
};

export const getNatalChart = (birthData: BirthData, isLocal: boolean, isCompatibility: boolean, isForecast: boolean) => {
  const [day, month, year] = birthData.date.split('.').map(Number);
  const [hour, minute, second] = birthData.time.split(':').map(Number);
  const utcOffset = birthData.utcOffset;
  const latitude = parseFloat(birthData.latitude);
  const longitude = parseFloat(birthData.longitude);
  const handleUTCDate = utcOffset ? convertToUTC(birthData.date, birthData.time, utcOffset) : undefined;

  const localLatitude = parseFloat(birthData.localLatitude);
  const localLongitude = parseFloat(birthData.localLongitude);

  const [dayComp, monthComp, yearComp] = birthData.dateComp.split('.').map(Number);
  const [hourComp, minuteComp, secondComp] = birthData.timeComp.split(':').map(Number);
  const utcOffsetComp = birthData.utcOffsetComp;
  const latitudeComp = parseFloat(birthData.latitudeComp);
  const longitudeComp = parseFloat(birthData.longitudeComp);
  const handleUTCDateComp = utcOffsetComp ? convertToUTC(birthData.dateComp, birthData.timeComp, utcOffsetComp) : undefined;

  const [dayFore, monthFore, yearFore] = birthData.dateFore.split('.').map(Number);
  const [hourFore, minuteFore, secondFore] = birthData.timeFore.split(':').map(Number); 
  const utcOffsetFore = birthData.utcOffsetFore;
  const handleUTCDateFore = utcOffsetFore ? convertToUTC(birthData.dateFore, birthData.timeFore, utcOffsetFore) : undefined;

  let origin;
  let horoscope;
  let utc;

  const houseSystem = birthData.houseSystem || 'koch'; // Берём систему домов

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

  if (isNaN(latitude) || isNaN(longitude)) {
    console.error("Некорректные координаты:", latitude, longitude);
    return;
  }

  if (!isLocal && !isCompatibility && !isForecast){
    origin = new Origin({
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
  
    
  }
  else if (isCompatibility){
    origin = new Origin({
      year: yearComp,
      month: monthComp - 1, // В JS месяцы с 0
      date: dayComp,
      hour: hourComp,
      minute: minuteComp,
      second: secondComp,
      latitude: latitudeComp,
      longitude: longitudeComp,
      handleUTCDate: handleUTCDateComp
    });
  }
  else if (isForecast){
    origin = new Origin({
      year: yearFore,
      month: monthFore - 1, // В JS месяцы с 0
      date: dayFore,
      hour: hourFore,
      minute: minuteFore,
      second: secondFore,
      latitude: latitude,
      longitude: longitude,
      handleUTCDate: handleUTCDateFore
    });
  }
  else{
    if (handleUTCDate){
      utc = utcOffset;
    } 
    else utc = getUTCFromOrigin(latitude, longitude);
  
    const handleUTCDateLocal = convertToUTC(birthData.date, birthData.time, utc);
  
    origin = new Origin({
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
  }
  
  horoscope = new Horoscope({
    origin,
    houseSystem: houseSystem,
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points'],
    aspectWithPoints: ['bodies', 'points'],
    aspectTypes: ['major'],
    customOrbs: customOrbs,
    language: 'en',
  });
  

  const planetsData = horoscope.CelestialBodies;
  let cuspsData = horoscope.Houses.map((house: any) => house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees);
  const ascendant = horoscope._ascendant.ChartPosition.Ecliptic.DecimalDegrees;

  // Правильный расчет домов для системы Коха
  if (horoscope._houseSystem == "koch") {
    cuspsData = setKochCusps(ascendant, cuspsData);
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

  const utcTime = origin.localTimeFormatted?.slice(-6) || ""; 

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

  const aspectDataPlanet = getAspectsForPlanet(astroData);

  return {
    astroData: astroData,
    planets: planetPositionsList,
    houses: housePositionsList,
    aspects: aspectDataPlanet,
    utcTime: origin.localTimeFormatted
  };
}

export  const getCalendarData = async (birthData: BirthData) => {
  const natalData = getNatalChart(birthData, false, false, false);
  let calendarData = [];

  if (natalData){
    const [day, month, year] = birthData.dateFore.split('.').map(Number);

    const startDate = new Date(year, month - 1, day, 0, 0, 0);
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    let current = new Date(startDate);

    while (current <= endDate) {
      // Форматируем дату и время для BirthData (dd.mm.yyyy / hh:mm:ss)
      const dateStr = current.toLocaleDateString('ru-RU').split('/').map((part: string) => part.padStart(2, '0')).join('.');
      const timeStr = current.toTimeString().split(' ')[0]; // формат hh:mm:ss

      const birthDataCurrent: BirthData = {
        date: dateStr,
        time: timeStr,
        latitude: birthData.latitude,
        city: birthData.city,
        localCity: birthData.localCity || "",
        longitude: birthData.longitude,
        localLatitude: birthData.localLatitude || "",
        localLongitude: birthData.localLongitude || "",
        utcOffset: birthData.utcOffsetFore || birthData.utcOffset,
        nameComp: "",
        dateComp: "",
        timeComp: "",
        cityComp: "",
        latitudeComp: "",
        longitudeComp: "",
        timeFore: timeStr,
        dateFore: dateStr,
        utcOffsetFore: birthData.utcOffsetFore || birthData.utcOffset,
        utcOffsetComp: "",
        houseSystem: birthData.houseSystem || "Placidus",
        style: birthData.style || "default",
        isLocal: false,
        isCompatibility: false,
        isFore: false
      };

      const natalCurrentData = getNatalChart(birthDataCurrent, false, false, false);
      let calendarDataCurrent;

      if (natalCurrentData){  
        const data = getAspectsBetweenCharts(natalData?.astroData, natalCurrentData?.astroData, true);
        calendarDataCurrent = {
          aspects: data,
          time: current
        }
        if (calendarDataCurrent?.aspects.length > 0) calendarData.push(calendarDataCurrent);
      } 
      else console.log("Ошибка расчетов текущего момента");

      current = new Date(current.getTime() + 60 * 60 * 1000); // +1 час

    }
  } else{
    console.log("Нет натальной карты для прогноза")
    return []
  }

  

  const dailyAspectMap = new Map<string, Map<string, any>>();

  for (const entry of calendarData) {
    const dateKey = entry.time.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!dailyAspectMap.has(dateKey)) {
      dailyAspectMap.set(dateKey, new Map());
    }

    const dayMap = dailyAspectMap.get(dateKey);

    if (dayMap){
      for (const aspect of entry.aspects) {
        const keyParts = [aspect.point1Key, aspect.point2Key].sort();
        const aspectKey = `${keyParts[0]}-${keyParts[1]}-${aspect.aspectKey}`;
  
        if (!dayMap.has(aspectKey) || aspect.orb < dayMap.get(aspectKey).orb) {
          dayMap.set(aspectKey, {
            ...aspect,
            time: entry.time,
          });
        }
      }
    }
  }

  // Преобразуем в массив для вывода
  const result = Array.from(dailyAspectMap.entries()).map(([date, aspectsMap]) => {
    return {
      date,
      aspects: Array.from(aspectsMap.values())
    };
  });

  const filteredResult = result
  .map(({ date, aspects }) => {
    return {
      date,
      aspects: aspects.filter(aspect => {
        if (!aspect.time) return false; // Без time — сразу отбрасываем

        let aspectDate = aspect.time.toString();
        aspectDate = aspectDate.split(' ')[2];
        const day = date.slice(-2);

        return aspectDate === day;
      })
    };
  })
  .filter(day => day.aspects.length > 0); // убираем дни без аспектов


  let exactTime = [];
  for (const item of filteredResult) {
    for (const aspect of item.aspects) {
      const data = await findExactAspectTime(natalData, birthData, aspect);
      exactTime.push(data);
    }
  }

  console.log(filteredResult)

  return {filteredResult, exactTime};
}

export const findExactAspectTime = async (natalData: any, birthData: any, {
  aspectKey,
  orb,
  point1Key,
  point1Label,
  point2Key,
  point2Label,
  time,
}: {
  aspectKey: "conjunction" | "opposition" | "trine" | "square" | "sextile";
  orb: number;
  point1Key: string;
  point1Label: string;
  point2Key: string;
  point2Label: string;
  time: Date;
}): Promise<{ time: Date; orb: number }> => {
  const maxIterations = 20;
  const threshold = 0.00001;
  const halfHour = 30 * 60 * 1000;

  let startTime = new Date(time.getTime() - halfHour);
  let endTime = new Date(time.getTime() + halfHour);

  let bestTime = time;
  let bestOrb = Infinity;

  for (let i = 0; i < maxIterations; i++) {
    const midTime = new Date((startTime.getTime() + endTime.getTime()) / 2);

    // Форматируем дату и время для BirthData (dd.mm.yyyy / hh:mm:ss)
    let dateStr = midTime.toLocaleDateString('ru-RU').split('/').map((part: string) => part.padStart(2, '0')).join('.');
    let timeStr = midTime.toTimeString().split(' ')[0]; // формат hh:mm:ss

    const birthDataCurrent: BirthData = {
      date: dateStr,
      time: timeStr,
      latitude: birthData.latitude,
      city: birthData.city,
      localCity: birthData.localCity || "",
      longitude: birthData.longitude,
      localLatitude: birthData.localLatitude || "",
      localLongitude: birthData.localLongitude || "",
      utcOffset: birthData.utcOffsetFore || birthData.utcOffset,
      nameComp: "",
      dateComp: "",
      timeComp: "",
      cityComp: "",
      latitudeComp: "",
      longitudeComp: "",
      timeFore: timeStr,
      dateFore: dateStr,
      utcOffsetFore: birthData.utcOffsetFore || birthData.utcOffset,
      utcOffsetComp: "",
      houseSystem: birthData.houseSystem || "Placidus",
      style: birthData.style || "default",
      isLocal: false,
      isCompatibility: false,
      isFore: false
    };

    const astroDataCurrent = await getNatalChart(birthDataCurrent, false, false, false);

    let aspects;
    let match;
    if (astroDataCurrent){
      aspects = getAspectsBetweenCharts(natalData.astroData, astroDataCurrent.astroData, true);

      match = aspects.find(a =>
        (a.point1Key === point1Key && a.point2Key === point2Key ||
         a.point1Key === point2Key && a.point2Key === point1Key) &&
        a.aspectKey === aspectKey
      );
    }

    if (match) {
      const orb = match.orb;

      if (orb < bestOrb) {
        bestOrb = orb;
        bestTime = midTime;
      }

      // Форматируем дату и время для BirthData (dd.mm.yyyy / hh:mm:ss)
      dateStr = startTime.toLocaleDateString('ru-RU').split('/').map((part: string) => part.padStart(2, '0')).join('.');
      timeStr = startTime.toTimeString().split(' ')[0]; // формат hh:mm:ss

      let birthDataCurrent: BirthData = {
        date: dateStr,
        time: timeStr,
        latitude: birthData.latitude,
        city: birthData.city,
        localCity: birthData.localCity || "",
        longitude: birthData.longitude,
        localLatitude: birthData.localLatitude || "",
        localLongitude: birthData.localLongitude || "",
        utcOffset: birthData.utcOffsetFore || birthData.utcOffset,
        nameComp: "",
        dateComp: "",
        timeComp: "",
        cityComp: "",
        latitudeComp: "",
        longitudeComp: "",
        timeFore: timeStr,
        dateFore: dateStr,
        utcOffsetFore: birthData.utcOffsetFore || birthData.utcOffset,
        utcOffsetComp: "",
        houseSystem: birthData.houseSystem || "Placidus",
        style: birthData.style || "default",
        isLocal: false,
        isCompatibility: false,
        isFore: false
      };

      
      const astroDataStart = await getNatalChart(birthDataCurrent, false, false, false);

      // Форматируем дату и время для BirthData (dd.mm.yyyy / hh:mm:ss)
      dateStr = endTime.toLocaleDateString('ru-RU').split('/').map((part: string) => part.padStart(2, '0')).join('.');
      timeStr = endTime.toTimeString().split(' ')[0]; // формат hh:mm:ss

      birthDataCurrent = {
        date: dateStr,
        time: timeStr,
        latitude: birthData.latitude,
        city: birthData.city,
        localCity: birthData.localCity || "",
        longitude: birthData.longitude,
        localLatitude: birthData.localLatitude || "",
        localLongitude: birthData.localLongitude || "",
        utcOffset: birthData.utcOffsetFore || birthData.utcOffset,
        nameComp: "",
        dateComp: "",
        timeComp: "",
        cityComp: "",
        latitudeComp: "",
        longitudeComp: "",
        timeFore: timeStr,
        dateFore: dateStr,
        utcOffsetFore: birthData.utcOffsetFore || birthData.utcOffset,
        utcOffsetComp: "",
        houseSystem: birthData.houseSystem || "Placidus",
        style: birthData.style || "default",
        isLocal: false,
        isCompatibility: false,
        isFore: false
      };

      const astroDataEnd = await getNatalChart(birthDataCurrent, false, false, false);

      let matchStart;
      if (astroDataStart){
        const aspectsStart = getAspectsBetweenCharts(astroDataStart.astroData, natalData.astroData , true); 
        matchStart = aspectsStart.find(a =>
          (a.point1Key === point1Key && a.point2Key === point2Key ||
          a.point1Key === point2Key && a.point2Key === point1Key) &&
          a.aspectKey === aspectKey
        );
      }

      let matchEnd;
      if (astroDataEnd){
        const aspectsEnd = getAspectsBetweenCharts(astroDataEnd.astroData, natalData.astroData, true); 
        matchEnd = aspectsEnd.find(a =>
          (a.point1Key === point1Key && a.point2Key === point2Key ||
          a.point1Key === point2Key && a.point2Key === point1Key) &&
          a.aspectKey === aspectKey
        );
      }

      if (matchStart && matchEnd && matchEnd.orb >= matchStart.orb) {
        endTime = midTime;
      } else {
        startTime = midTime;
      }

      if (orb < threshold) {
        break;
      }
    }
  }

  return { time: bestTime, orb: bestOrb };
};

