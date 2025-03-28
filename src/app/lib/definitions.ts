export interface BirthData {
    date: string;
    time: string;
    latitude: string;
    longitude: string;
    utcOffset: string;
    houseSystem: string;
    style: string;
}
  // Интерфейс для координат планет
export interface PlanetPositions {
    [key: string]: [number]; // Каждая планета содержит массив с одним числом (градус в эклиптике)
}
export interface Planet {
  name: string; // Например, "sun"
  isRetrograde: string;
  sign: string; // Например, "aries"
  position: string; // Например, "15°"
  house: number; // Например, 7
}

// Интерфейс для аспекта
export interface Aspect {
  point1Key: string;
  point1Label: string;
  point2Key: string;
  point2Label: string;
  aspectKey: string;
  orb: number;
}


// Интерфейс для натальных данных
export interface AstroData {
    planets: PlanetPositions;
    cusps: number[]; // Дома представлены массивом чисел (градусы начала домов)
}
export interface NatalChartProps {
    birthData: BirthData;
    setPlanetPositions: (positions: any[]) => void;
    setHousePositions: (positions: any[]) => void;
    setAspectPositions: (positions: any) => void;
    setLocalTime?: (time: string) => void;
}