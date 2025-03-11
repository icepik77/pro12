'use client'

import { useState, useEffect } from "react";
import BirthForm from "./ui/BirthForm";
import NatalChart from "./ui/NatalChart";
import PlanetTable from "./ui/PlanetTable";
import HouseTable from "./ui/HouseTable"
import { motion } from "framer-motion"; // Импортируем framer-motion

export default function Home() {
  const [birthData, setBirthData] = useState({
    date: "",
    time: "",
    latitude: "",
    longitude: ""
  });

  const [planetPositions, setPlanetPositions] = useState<any[]>([]);
  const [housePositions, setHousePositions] = useState<any[]>([]);

  // Отслеживаем изменение данных в planetPositions
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (planetPositions.length > 0 && housePositions.length > 0) {
      setIsDataLoaded(true); // Когда данные загружены, запускаем анимацию
    }
  }, [planetPositions, housePositions]); // useEffect срабатывает, когда planetPositions обновляются

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] pt-3 bg-black">
      <main className="w-full items-center sm:items-start bg-black">
        <div className="w-full bg-white rounded-t-[50px] p-10 shadow-lg">
          <div className="flex flex-wrap justify-center gap-10 w-full max-w-7xl mx-auto">
            <motion.div
              className="w-full md:w-[48%] flex justify-center"
              initial={{ opacity: 0 }} // Начальная прозрачность
              animate={{ opacity: 1 }}  // Конечная прозрачность
              transition={{ duration: 1 }} // Плавное появление за 1 секунду
            >
              <BirthForm setBirthData={setBirthData} />
            </motion.div>

            {/* Плавное появление карты только после загрузки данных */}
            <motion.div
              className="w-full md:w-[48%] flex justify-center"
              initial={{ opacity: 0 }} // Начальная прозрачность
              animate={{ opacity: isDataLoaded ? 1 : 0 }} // Когда данные загружены — плавное появление
              transition={{ duration: 1 }} // Плавное появление за 1 секунду
            >
              <NatalChart birthData={birthData} setPlanetPositions={setPlanetPositions} setHousePositions={setHousePositions}/>
            </motion.div>

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
          </div>
        </div>
          {/* Футер */}
        <footer className="bg-black p-6 rounded-t-[50px]">
          <div className="text-white text-center">
            <p>© 2025 Натальная карта. Все права защищены.</p>
          </div>
        </footer>
      </main>

      
    </div>

  );
}
