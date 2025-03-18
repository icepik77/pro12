export interface BirthData {
    date: string;
    time: string;
    latitude: string;
    longitude: string;
    houseSystem: string
}
  // Интерфейс для координат планет
export interface PlanetPositions {
    [key: string]: [number]; // Каждая планета содержит массив с одним числом (градус в эклиптике)
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
    setAspectPositions: (positions: any[]) => void;
    setLocalTime?: (time: string) => void;
}