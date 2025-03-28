import { AstroData, Aspect } from "./definitions";
import { Origin } from "circular-natal-horoscope-js";

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

  console.log("origin", origin);

  console.log("utc ", origin.localTimeFormatted?.slice(-6))

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




