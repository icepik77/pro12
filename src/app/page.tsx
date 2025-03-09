'use client';

import { useState } from "react";
import BirthForm from "./ui/BirthForm";
import NatalChart from "./ui/NatalChart";

export default function Home() {
  // Состояние для хранения данных из формы
  const [birthData, setBirthData] = useState({
    date: "",
    time: "",
    latitude: "",
    longitude: ""
  });

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] pt-3 bg-black">
      <main className="w-full items-center sm:items-start bg-black">
        <div className="w-full bg-white rounded-t-[50px] p-10 shadow-lg">
          <div className="flex flex-col justify-center items-center gap-10 w-full max-w-7xl mx-auto">
            {/* Передаем setBirthData, чтобы обновлять состояние */}
            <BirthForm setBirthData={setBirthData} />
            {/* Передаем данные в Натальную карту */}
            <NatalChart birthData={birthData} />
          </div>
        </div>
      </main>
      <footer className="flex gap-6 flex-wrap items-center justify-center bg-black h-[100px] w-full rounded-t-[30px]"></footer>
    </div>
  );
}
