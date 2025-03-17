import { AstroData } from "./definitions";

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
    const pointPosition = astroData.planets[aspect.point1Label]?.[0] || 0;
    const toPointPosition = astroData.planets[aspect.point2Label]?.[0] || 0;

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