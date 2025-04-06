export interface BirthData {
    date: string;
    time: string;
    latitude: string;
    city: string;
    localCity: string;
    longitude: string;
    localLatitude: string;
    localLongitude: string;
    utcOffset: string;
    nameComp: string;
    dateComp: string;
    timeComp: string;
    cityComp: string;
    latitudeComp: string;
    longitudeComp: string;
    utcOffsetComp: string;
    houseSystem: string;
    style: string;
    isLocal: boolean;
    isCompatibility: boolean;
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

export interface PlanetPositionList {
  name: string;
  isRetrograde: boolean;
  sign: string;
  position: string;
  house: number;
}

export interface HousePositionsList {
  name: string; 
  position: string;
  sign: string;
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

export interface NatalData{
  astroData: AstroData,
  planets: PlanetPositionList,
  houses: HousePositionsList,
  aspects: Aspect[],
  utcTime: string
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
    setLocalPlanetPositions: (localPositions: any) => void;
    setLocalHousePositions: (localPositions: any) => void;
    setLocalAspectPositions: (localPositions: any) => void;
    setCompPlanetPositions: (compPositions: any) => void;
    setCompHousePositions: (compPositions: any) => void;
    setCompAspectPositions: (compPositions: any) => void;
    setCompPairPositions: (compPositions: any) => void;
    setLocalTime?: (time: string) => void;
    activeTab: "chart1" | "chart2"; 
    setActiveTab: (tab: "chart1" | "chart2") => void;
    showPairPositions: boolean;
    setShowPairPositions: (value: boolean) => void;
}