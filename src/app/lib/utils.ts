import { AstroData, Aspect } from "./definitions";


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

export const findHouseForPlanet = (decimalDegrees: number, cuspsData: number[]) => {
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

// Функция для форматирования UTC смещения в "±HH:MM"
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

export function modulo(n: number, m: number): number {
  return ((n % m) + m) % m;
}

