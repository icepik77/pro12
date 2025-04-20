import { AstroData, Aspect, BirthData, House, HousePositionsList } from "./definitions";
import { Origin, Horoscope } from "circular-natal-horoscope-js";

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

export const getAspectsBetweenChartForecast = (astroData1: AstroData, astroData2: AstroData, houseData1: House[], houseData2: House[]) => { 
  const aspects = {
    conjunction: 0,
    opposition: 180,
    trine: 120,
    square: 90,
    sextile: 60,
    semisextile: 30, 
    quincunx: 150     
  };
  
  const orbs = {
    Sun: 1,
    Moon: 1,
    Mercury: 1,
    Venus: 1,
    Mars: 1,
    Jupiter: 1,
    Saturn: 1,
    Uranus: 1,
    Neptune: 1,
    Pluto: 1,
    Lilith: 1,
    NNode: 1,
    First: 1,
    Second: 1,
    Third: 1,
    Fourth: 1,
    Fifth: 1,
    Sixth: 1,
    Seventh: 1,
    Eighth: 1,
    Ninth: 1,
    Tenth: 1,
    Eleventh: 1,
    Twelfth: 1,
  };
    
  let foundAspects: Aspect[] = [];

  const planetsArray1 = Object.entries(astroData1.planets).map(([name, position]) => ({
    name,
    position: position[0], // уже объект с градусами, знаком и т.д.
  }));

  const housesArray1 = houseData1.map((house: House, index: number) => ({
    name: house.label,
    position: house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees
  }));
  
  const planetsArray2 = Object.entries(astroData2.planets).map(([name, position]) => ({
    name,
    position: position[0],
  }));

  // Теперь добавим дома в общий массив:
  const housesArray2 = houseData2.map((house: House, index: number) => ({
    name: house.label,
    position: house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees
  }));

  const combinedArray1 = [...planetsArray1, ...housesArray1];
  const combinedArray2 = [...planetsArray2, ...housesArray2];

  combinedArray1.forEach((planetA) => {
    combinedArray2.forEach((planetB) => {
      const degreeA = planetA.position;
      const degreeB = planetB.position;

      const diff = Math.abs(degreeA - degreeB);
      const adjustedDiff = Math.min(diff, 360 - diff);

      Object.entries(aspects).forEach(([aspect, aspectDegree]) => {
        const orbA = orbs[planetA.name as keyof typeof orbs]
        const orbB = orbs[planetB.name as keyof typeof orbs]
        let maxOrb;
  
        maxOrb = Math.min(orbA, orbB);
         
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
  else if ((isForecast && !isLocal)){
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
  else if(isLocal && isForecast){
    if (handleUTCDate){
      utc = utcOffset;
    } 
    else utc = getUTCFromOrigin(latitude, longitude);

    const handleUTCDateLocal = convertToUTC(birthData.date, birthData.time, utc);
  
    origin = new Origin({
      year: yearFore,
      month: monthFore - 1, // В JS месяцы с 0
      date: dayFore,
      hour: hourFore,
      minute: minuteFore,
      second: secondFore,
      latitude: localLatitude,
      longitude: localLongitude,
      handleUTCDate: handleUTCDateLocal
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

export const getProgressionChart = (birthData: BirthData) => {
  const {originProgress, horoscope, planetsData, progressedCusps, ascendant} = getProgressionData(birthData);

  return getAstroData(originProgress, horoscope, planetsData, progressedCusps, ascendant);
}

const getProgressionData = (birthData: BirthData) =>{
  let horoscope;
  
  const originNatal = setOrigin(birthData, birthData.isLocal, false, false);
  let originProgress = setOrigin(birthData, birthData.isLocal, false, true);

  const natalTime = originNatal.julianDate;  
  const interestTime = originProgress.julianDate;

  const kp = calculateProgressionCoefficient(natalTime, interestTime);

  const utcTime = birthData.utcOffset? birthData.utcOffset : originNatal.localTimeFormatted?.slice(-6); 

  const progressionMoment = calculateProgressionMomentFromJulian(natalTime, interestTime, utcTime);

  const { date, time } = formatDateTimeForBirthData(progressionMoment);
  
  const birthDataCurrent: BirthData = {
    date: date,
    time: time,
    latitude: birthData.latitude,
    city: birthData.city,
    localCity: birthData.localCity || "",
    longitude: birthData.longitude,
    localLatitude: birthData.localLatitude || "",
    localLongitude: birthData.localLongitude || "",
    utcOffset: "",
    nameComp: "",
    dateComp: "",
    timeComp: "",
    cityComp: "",
    latitudeComp: "",
    longitudeComp: "",
    timeFore: "",
    dateFore: "",
    utcOffsetFore: birthData.utcOffsetFore,
    utcOffsetComp: "",
    houseSystem: birthData.houseSystem || "Placidus",
    style: birthData.style || "default",
    isLocal: false,
    isCompatibility: false,
    isFore: false,
    isForeSlow: false
  };

  originProgress = setOrigin(birthDataCurrent, birthData.isLocal, false, false);

  horoscope = new Horoscope({
    origin: originProgress,
    houseSystem: birthData.houseSystem || 'koch',
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points'],
    aspectWithPoints: ['bodies', 'points'],
    aspectTypes: ['major'],
    customOrbs: {
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
    },
    language: 'en',
  });

  const horoscopeOriginNatal = new Horoscope({
    origin: originNatal,
    houseSystem: birthData.houseSystem || 'koch',
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points'],
    aspectWithPoints: ['bodies', 'points'],
    aspectTypes: ['major'],
    customOrbs: {
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
    },
    language: 'en',
  });

  let cuspsData = horoscopeOriginNatal.Houses.map((house: any) => house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees);
  
  const planetsData = horoscope.CelestialBodies;
  const ascendant = horoscopeOriginNatal._ascendant.ChartPosition.Ecliptic.DecimalDegrees;
  const progressedCusps = recalculateCusps(cuspsData, kp);

  return {originProgress, horoscope, planetsData, progressedCusps, ascendant}
}

const getAstroData = (origin: Origin, horoscope: Horoscope, planetsData:any, cuspsData: any, ascendant: number) => {

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

export const getNatalHouses = (birthData: BirthData, isLocal: boolean, isCompatibility: boolean, isForecast: boolean) => {
  let horoscope;
  
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

  const origin = setOrigin(birthData, isLocal, isCompatibility, isForecast);
  
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

  return horoscope.Houses;
}

const setProgressionHouses = (cusps: number[]): House[] => {
  const houseNames = [
    'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth',
    'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth'
  ];

  return cusps.map((degree, index) => ({
    ChartPosition: {
      StartPosition: {
        Ecliptic: {
          DecimalDegrees: degree
        }
      }
    },
    label: houseNames[index]
  }));
};

export const setOrigin = (birthData: BirthData, isLocal: boolean, isCompatibility: boolean, isForecast: boolean) => {
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
  let utc;

  if (isNaN(latitude) || isNaN(longitude)) {
    console.error("Некорректные координаты:", latitude, longitude);
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
  else if (isForecast && !isLocal){
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
  else if(isLocal && isForecast){
    if (handleUTCDate){
      utc = utcOffset;
    } 
    else utc = getUTCFromOrigin(latitude, longitude);

    const handleUTCDateLocal = convertToUTC(birthData.date, birthData.time, utc);
  
    origin = new Origin({
      year: yearFore,
      month: monthFore - 1, // В JS месяцы с 0
      date: dayFore,
      hour: hourFore,
      minute: minuteFore,
      second: secondFore,
      latitude: localLatitude,
      longitude: localLongitude,
      handleUTCDate: handleUTCDateLocal
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

  return origin;
}

export  const getCalendarData = (birthData: BirthData) => {
  const natalData = getNatalChart(birthData, birthData.isLocal? true : false, false, false);
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
        utcOffset: birthData.utcOffset,
        nameComp: "",
        dateComp: "",
        timeComp: "",
        cityComp: "",
        latitudeComp: "",
        longitudeComp: "",
        timeFore: timeStr,
        dateFore: dateStr,
        utcOffsetFore: birthData.utcOffsetFore,
        utcOffsetComp: "",
        houseSystem: birthData.houseSystem || "Placidus",
        style: birthData.style || "default",
        isLocal: false,
        isCompatibility: false,
        isFore: false,
        isForeSlow: false
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
    console.log("Нет натальной карты для прогноза");
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


  

  return filteredResult;
}

export const getSlowProgressionCalendar = (birthData: BirthData) => {
  const natalData = getNatalChart(birthData, birthData.isLocal, false, false);
  if (!natalData) {
    console.log("Невозможно построить натальную карту.");
    return [];
  }

  const [day, month, year] = birthData.dateFore.split('.').map(Number);
  const centerDate = new Date(year, month - 1, day);
  const startDate = new Date(centerDate.getTime() - 365 * 24 * 60 * 60 * 1000);
  const endDate = new Date(centerDate.getTime() + 365 * 24 * 60 * 60 * 1000);

  const activeAspects = new Map<string, {
    start: Date,
    end: Date | null,
    aspect: any,
    orbAtStart?: number,
    orbAtEnd?: number
  }>();
  const calendarData: { start: Date, end: Date, aspect: any }[] = [];

  for (let current = new Date(startDate); current <= endDate; current.setDate(current.getDate() + 1)) {
    const dateStr = current.toLocaleDateString('ru-RU').split('/').map(part => part.padStart(2, '0')).join('.');

    const birthDataCurrent: BirthData = {
      ...birthData,
      date: birthData.date,
      time: birthData.time,
      timeFore: birthData.timeFore,
      dateFore: dateStr,
    };

    const progressedChart = getProgressionChart(birthDataCurrent);
    if (!progressedChart) continue;

    let natalHouses = getNatalHouses(birthDataCurrent, birthDataCurrent.isLocal? true : false, false, false);
    let natalProgressionData = getProgressionData(birthDataCurrent);

    const natalForecastHouses = setProgressionHouses(natalProgressionData.progressedCusps);

    const aspects = getAspectsBetweenChartForecast(
      natalData.astroData,
      progressedChart.astroData,
      natalHouses,
      natalForecastHouses
    );

    const seenThisDay = new Set<string>();

    console.log("current", current);
    console.log("aspects", aspects);

    for (const aspect of aspects) {
      if (Math.abs(aspect.orb - 1.0) < 0.04) {
        const keyParts = [aspect.point1Key, aspect.point2Key].sort();
        const key = `${keyParts[0]}-${keyParts[1]}-${aspect.aspectKey}`;
      
        seenThisDay.add(key);
      
        // Только если ещё не отслеживаем
        if (!activeAspects.has(key)) {
          activeAspects.set(key, {
            start: new Date(current),
            end: null,
            aspect,
            orbAtStart: aspect.orb,
          });
        }
      }
      
      // Если орбис стал ≈ 0, фиксируем конец аспекта
      if (Math.abs(aspect.orb) < 0.01) {
        const keyParts = [aspect.point1Key, aspect.point2Key].sort();
        const key = `${keyParts[0]}-${keyParts[1]}-${aspect.aspectKey}`;
      
        seenThisDay.add(key);
      
        const tracked = activeAspects.get(key);
        if (tracked && !tracked.end) {
          tracked.end = new Date(current);
          tracked.orbAtEnd = aspect.orb;
        }
      }
    }

    // for (const aspect of aspects) {
    //   if (aspect.orb <= 1) {
    //     const keyParts = [aspect.point1Key, aspect.point2Key].sort();
    //     const key = `${keyParts[0]}-${keyParts[1]}-${aspect.aspectKey}`;
      
    //     seenThisDay.add(key);
      
    //     const existing = activeAspects.get(key);
      
    //     if (!existing) {
    //       activeAspects.set(key, {
    //         start: new Date(current),
    //         end: null,
    //         aspect,
    //         orbAtStart: aspect.orb
    //       });
    //     }
      
    //     // Если аспект стал точным — фиксируем его как end
    //     if (Math.abs(aspect.orb) < 0.01) {
    //       const tracked = activeAspects.get(key);
    //       if (tracked) {
    //         tracked.end = new Date(current);
    //         tracked.orbAtEnd = aspect.orb;
    //       }
    //     }
    //   }
    // }

    for (const [key, value] of activeAspects.entries()) {
      if (!seenThisDay.has(key) && value.end) {
        console.log(`Аспект ${value.aspect.point1Key} ${value.aspect.aspectKey} ${value.aspect.point2Key}:`);
        console.log(`  orbAtStart: ${value.orbAtStart?.toFixed(2)}°`);
        console.log(`  orbAtEnd:   ${value.orbAtEnd?.toFixed(2)}°`);
        
        calendarData.push({
          start: value.start,
          end: value.end,
          aspect: value.aspect,
        });
    
        activeAspects.delete(key);
      }
    }
  }

  // Закрываем висячие аспекты и обрезаем end по границе
  for (const { start, end, aspect } of activeAspects.values()) {
    if (end) {
      const adjustedStart = new Date(start.getTime() - 24 * 60 * 60 * 1000); // минус 1 день
      const adjustedEnd = new Date(end.getTime() - 48 * 60 * 60 * 1000); // минус 1 день
      calendarData.push({
        start:adjustedStart,
        end: adjustedEnd,
        aspect
      });
    }
    
    // Если нет end — аспект не дошёл до точного (orb = 0), значит не нужен
  }
  

  // // Фильтруем: берём только аспекты, активные 06.04.2025 и позже, но не выходящие за пределы года вперёд
  // const filtered = calendarData.filter(({ start, end }) => {
  //   return end >= centerDate && start <= endDate;
  // });

  const filtered = calendarData
  .filter(({ start, end }) => end >= centerDate && start <= endDate)
  .filter(({ aspect }) => {
    // Убираем соединения типа Луна-Луна и т.п.
    return !(aspect.aspectKey === 'conjunction' && aspect.point1Key === aspect.point2Key);
  });

  console.log("filtered", filtered); 

  return filtered;
};

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
      utcOffset: birthData.utcOffset,
      nameComp: "",
      dateComp: "",
      timeComp: "",
      cityComp: "",
      latitudeComp: "",
      longitudeComp: "",
      timeFore: timeStr,
      dateFore: dateStr,
      utcOffsetFore: birthData.utcOffsetFore,
      utcOffsetComp: "",
      houseSystem: birthData.houseSystem || "Placidus",
      style: birthData.style || "default",
      isLocal: false,
      isCompatibility: false,
      isFore: false, 
      isForeSlow: false
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
        utcOffset: birthData.utcOffset,
        nameComp: "",
        dateComp: "",
        timeComp: "",
        cityComp: "",
        latitudeComp: "",
        longitudeComp: "",
        timeFore: timeStr,
        dateFore: dateStr,
        utcOffsetFore: birthData.utcOffsetFore,
        utcOffsetComp: "",
        houseSystem: birthData.houseSystem || "Placidus",
        style: birthData.style || "default",
        isLocal: false,
        isCompatibility: false,
        isFore: false, 
        isForeSlow: false
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
        utcOffset: birthData.utcOffset,
        nameComp: "",
        dateComp: "",
        timeComp: "",
        cityComp: "",
        latitudeComp: "",
        longitudeComp: "",
        timeFore: timeStr,
        dateFore: dateStr,
        utcOffsetFore: birthData.utcOffsetFore,
        utcOffsetComp: "",
        houseSystem: birthData.houseSystem || "Placidus",
        style: birthData.style || "default",
        isLocal: false,
        isCompatibility: false,
        isFore: false, 
        isForeSlow: false
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

function toJulianDate(dateUTC: Date): number {
  const year = dateUTC.getUTCFullYear();
  const month = dateUTC.getUTCMonth() + 1;
  const day = dateUTC.getUTCDate();
  const hour = dateUTC.getUTCHours();
  const minute = dateUTC.getUTCMinutes();
  const second = dateUTC.getUTCSeconds();

  let Y = year;
  let M = month;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }

  const D = day + (hour + minute / 60 + second / 3600) / 24;
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);

  const JD = Math.floor(365.25 * (Y + 4716)) +
             Math.floor(30.6001 * (M + 1)) +
             D + B - 1524.5;

  return JD;
}

export function calculateProgressionCoefficient(
  natalDateUTC: number,
  interestDateUTC: number,
  progressionPeriod: number = 365
): number {
  const jdNatal = natalDateUTC;
  const jdInterest = interestDateUTC;
  return (jdInterest - jdNatal) / progressionPeriod;
}

export function calculateProgressionMoment(
  natalDateUTC: Date,
  interestDateUTC: Date,
  progressionPeriod: number = 365
): Date {
  const jdNatal = toJulianDate(natalDateUTC);
  const jdInterest = toJulianDate(interestDateUTC);
  const kp = (jdInterest - jdNatal) / progressionPeriod;

  const secondsPerDay = 86400;
  const addedSeconds = kp * secondsPerDay;

  const pmTimestamp = natalDateUTC.getTime() + addedSeconds * 1000; // переводим в мс
  return new Date(pmTimestamp);
}

function calculateProgressionMomentFromJulian(
  jdNatal: number,
  jdInterest: number,
  utc: string,
  progressionPeriod: number = 365
): Date {
  const kp = (jdInterest - jdNatal) / progressionPeriod;
  const addedSeconds = kp * 86400;
  const natalTimestamp = julianToUnixTimestamp(jdNatal);
  const pmTimestampUTC = natalTimestamp + addedSeconds * 1000;

  // Парсинг UTC-офсета
  const match = utc.match(/^([+-])(\d{2}):(\d{2})$/);
  if (!match) throw new Error("Invalid UTC format. Use format ±HH:MM");

  const sign = match[1] === "+" ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);
  const offsetMs = sign * (hours * 60 + minutes) * 60 * 1000;

  const localTimestamp = pmTimestampUTC + offsetMs;

  return new Date(localTimestamp);
}

function julianToUnixTimestamp(jd: number): number {
  const JD_UNIX_EPOCH = 2440587.5;
  return (jd - JD_UNIX_EPOCH) * 86400 * 1000;
}

function formatDateTimeForBirthData(date: Date): { date: string, time: string } {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return {
    date: `${day}.${month}.${year}`,
    time: `${hours}:${minutes}:${seconds}`
  };
}

function recalculateCusps(cusps: number[], kp: number): number[] {
  return cusps.map(degree => {
    let progressed = degree + kp;
    progressed = parseFloat(progressed.toFixed(4)); // округляем и превращаем обратно в число
    return (progressed + 360) % 360;
  });
}


