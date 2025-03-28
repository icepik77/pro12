'use client'

import { useState, useEffect } from "react";
import BirthForm from "./ui/BirthForm";
import PlanetTable from "./ui/PlanetTable";
import HouseTable from "./ui/HouseTable"
import AspectTable from "./ui/AspectTable";
import { motion } from "framer-motion"; // Импортируем framer-motion
import Header from "./ui/Header";
import dynamic from 'next/dynamic';

const NatalChart = dynamic(() => import('./ui/NatalChart'), { ssr: false });

// Словарь для выбора оформления
const styleOptions = [
  { value: "heavenly", label: "Небесная" },
  { value: "management", label: "Управление" },
  { value: "elements", label: "Стихии" },
];


export default function Home() {
  const [birthData, setBirthData] = useState({
    name: "",
    date: "",
    time: "",
    city: "",
    localCity: "",
    latitude: "",
    longitude: "",
    localLatitude: "",
    localLongitude: "",
    utcOffset: "",
    houseSystem: "koch",
    style: "elements", 
  });

  const [planetPositions, setPlanetPositions] = useState<any[]>([]);
  const [housePositions, setHousePositions] = useState<any[]>([]);
  const [aspectPositions, setAspectPositions] = useState<any>();

  const [localPlanetPositions, setLocalPlanetPositions] = useState<any[]>([]);
  const [localHousePositions, setLocalHousePositions] = useState<any[]>([]);
  const [LocalAspectPositions, setLocalAspectPositions] = useState<any>();

  const [activeTab, setActiveTab] = useState<"chart1" | "chart2">("chart1");

  const [localTime, setLocalTime] = useState<string | undefined>();

  // Отслеживаем изменение данных в planetPositions
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (planetPositions.length > 0 && housePositions.length > 0) {
      setIsDataLoaded(true); // Когда данные загружены, запускаем анимацию
    }
  }, [planetPositions, housePositions, aspectPositions]); // useEffect срабатывает, когда planetPositions обновляются

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] pt-3">
      <main className="w-full items-center sm:items-start">
        <div className="w-full bg-white rounded-t-[50px]">
          <Header/>
          <div className="flex flex-col flex-wrap items-center justify-center gap-1 w-full max-w-7xl mx-auto">
            <motion.div
              className="w-full md:w-[48%] flex justify-center"
              initial={{ opacity: 0 }} // Начальная прозрачность
              animate={{ opacity: 1 }}  // Конечная прозрачность
              transition={{ duration: 1 }} // Плавное появление за 1 секунду
            >
              <BirthForm setBirthData={setBirthData} localTime={localTime}/>
            </motion.div>

            {/* Плавное появление карты только после загрузки данных */}
            <motion.div
              className="w-full md:w-[48%] flex justify-center"
              initial={{ opacity: 0 }} // Начальная прозрачность
              animate={{ opacity: isDataLoaded ? 1 : 0 }} // Когда данные загружены — плавное появление
              transition={{ duration: 1 }} // Плавное появление за 1 секунду
            >
              <NatalChart 
                birthData={birthData} 
                setPlanetPositions={setPlanetPositions} 
                setHousePositions={setHousePositions} 
                setAspectPositions={setAspectPositions} 
                setLocalTime={setLocalTime}
                setLocalPlanetPositions={setLocalPlanetPositions}
                setLocalHousePositions={setLocalHousePositions}
                setLocalAspectPositions={setLocalAspectPositions}  
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </motion.div>

            {birthData.longitude && activeTab == "chart1" && (
              <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                <h3 className="text-lg font-medium">Введенные данные:</h3>
                <p><strong>Имя:</strong> {birthData.name}</p>
                <p><strong>Дата, время (часовой пояс):</strong> {birthData.date}, {birthData.time} ({birthData.utcOffset || localTime})</p>
                <p><strong>Город:</strong> {birthData.city}</p>
                <p><strong>Широта:</strong> {birthData.latitude}</p>
                <p><strong>Долгота:</strong> {birthData.longitude}</p>
                <p><strong>Система домов:</strong> {birthData.houseSystem}</p>
                <p><strong>Оформление:</strong> {styleOptions.find(option => option.value === birthData.style)?.label}</p>
              </div>
            )}

            {birthData.longitude && activeTab == "chart2" && (
                          <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                            <h3 className="text-lg font-medium">Введенные данные:</h3>
                            <p><strong>Имя:</strong> {birthData.name}</p>
                            <p><strong>Дата, время (часовой пояс):</strong> {birthData.date}, {birthData.time} ({birthData.utcOffset || localTime})</p>
                            <p><strong>Город:</strong> {birthData.localCity}</p>
                            <p><strong>Широта:</strong> {birthData.localLatitude}</p>
                            <p><strong>Долгота:</strong> {birthData.localLongitude}</p>
                            <p><strong>Система домов:</strong> {birthData.houseSystem}</p>
                            <p><strong>Оформление:</strong> {styleOptions.find(option => option.value === birthData.style)?.label}</p>
                          </div>
                        )}

            {activeTab == "chart1" && 
            <div>
              {/* Плавное появление таблицы только после загрузки данных */}
              <motion.div
                className="w-full flex justify-center"
                initial={{ opacity: 0 }} // Начальная прозрачность
                animate={{ opacity: isDataLoaded ? 1 : 0 }} // Когда данные загружены — плавное появление
                transition={{ duration: 1 }} // Плавное появление за 1 секунду
              >
                <PlanetTable planetPositions={planetPositions} />
              </motion.div>

              {/* Плавное появление таблицы домов только после загрузки данных */}
              <motion.div
                className="w-full flex justify-center"
                initial={{ opacity: 0 }} // Начальная прозрачность
                animate={{ opacity: isDataLoaded ? 1 : 0 }} // Когда данные загружены — плавное появление
                transition={{ duration: 1 }} // Плавное появление за 1 секунду
              >
                <HouseTable housePositions={housePositions} />
              </motion.div>

              {/* Плавное появление таблицы аспектов только после загрузки данных */}
              <motion.div
                className="w-full flex justify-center"
                initial={{ opacity: 0 }} // Начальная прозрачность
                animate={{ opacity: isDataLoaded ? 1 : 0 }} // Когда данные загружены — плавное появление
                transition={{ duration: 1 }} // Плавное появление за 1 секунду
              >
                <AspectTable
                  aspectsPositions={aspectPositions ? aspectPositions.aspects : []}
                  planets={aspectPositions ? aspectPositions.planets : []}
                />
              </motion.div>
            </div>}
          </div>
          {activeTab == "chart2" && <div>
            {/* Плавное появление таблицы только после загрузки данных */}
            <motion.div
              className="w-full flex justify-center"
              initial={{ opacity: 0 }} // Начальная прозрачность
              animate={{ opacity: isDataLoaded ? 1 : 0 }} // Когда данные загружены — плавное появление
              transition={{ duration: 1 }} // Плавное появление за 1 секунду
            >
              <PlanetTable planetPositions={localPlanetPositions} />
            </motion.div>

            {/* Плавное появление таблицы домов только после загрузки данных */}
            <motion.div
              className="w-full flex justify-center"
              initial={{ opacity: 0 }} // Начальная прозрачность
              animate={{ opacity: isDataLoaded ? 1 : 0 }} // Когда данные загружены — плавное появление
              transition={{ duration: 1 }} // Плавное появление за 1 секунду
            >
              <HouseTable housePositions={localHousePositions} />
            </motion.div>

            {/* Плавное появление таблицы аспектов только после загрузки данных */}
            <motion.div
              className="w-full flex justify-center"
              initial={{ opacity: 0 }} // Начальная прозрачность
              animate={{ opacity: isDataLoaded ? 1 : 0 }} // Когда данные загружены — плавное появление
              transition={{ duration: 1 }} // Плавное появление за 1 секунду
            >
              <AspectTable
                aspectsPositions={LocalAspectPositions ? LocalAspectPositions.aspects : []}
                planets={LocalAspectPositions ? LocalAspectPositions.planets : []}
              />
            </motion.div>
          </div>}

        </div>
          {/* Футер */}
        <footer className="p-6 rounded-t-[50px] bg-[#172935]">
          <div className="text-white text-center">
            <p>© 2025 ORION. Все права защищены.</p>
          </div>
        </footer>
      </main>

      
    </div>

  );
}
