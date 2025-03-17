'use client';

import { useState } from "react";
import { searchCityCoordinates } from "../../../utils/geo";
import { formatUtcOffset } from "../lib/utils";

interface BirthFormProps {
  setBirthData: (data: any) => void;
}

// Словарь для перевода систем домов
const houseSystemNames: Record<string, string> = {
  "koch": "Кох",
  "placidus": "Плацидус",
  "campanus": "Кампано",
  "whole-sign": "Целый знак",
  "equal-house": "Равнодомная система",
  "regiomontanus": "Региомонтан",
  "topocentric": "Топоцентрическая",
};

export default function BirthForm({ setBirthData }: BirthFormProps) {
  const [formData, setFormData] = useState({
    name: "Иван Иванов",
    date: "1990-01-01",
    time: "12:00",
    city: "Москва",
    latitude: "",
    longitude: "",
    utcOffset: "",
    houseSystem: "placidus",
  });

  const [submittedData, setSubmittedData] = useState<any | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const city = e.target.value;
    setFormData({ ...formData, city });

    if (city.length > 2) {
      const coords = await searchCityCoordinates(city);
      if (coords) {
        const utcOffset = formatUtcOffset(coords.lon / 15);

        setFormData((prev) => ({
          ...prev,
          latitude: coords.lat.toFixed(4),
          longitude: coords.lon.toFixed(4),
          utcOffset,
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBirthData(formData);
    setSubmittedData(formData); // Сохраняем данные для отображения
  };

  return (
    <div className="flex flex-col items-center bg-white text-black p-6">
      <div className="max-w-2xl w-full">
        <h2 className="text-3xl font-medium mb-2">Заполните данные о рождении</h2>
        <p className="text-gray-500 mb-8">Чтобы мы могли составить натальную карту</p>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <div className="space-y-4">
            {/* Имя */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Имя</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                required
              />
            </div>

            {/* Дата */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Дата рождения</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                required
              />
            </div>

            {/* Время */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Время рождения</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                required
              />
            </div>

            {/* Город */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Город рождения</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleCityChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                required
              />
            </div>

            {/* Часовой пояс */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Часовой пояс (UTC)</label>
              <input
                type="text"
                name="utcOffset"
                value={formData.utcOffset}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            {/* Система домов */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Система домов</label>
              <select
                name="houseSystem"
                value={formData.houseSystem}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
              >
                <option value="koch">Кох</option>
                <option value="placidus">Плацидус</option>
                <option value="campanus">Компано</option>
                <option value="whole-sign">Целый знак</option>
                <option value="equal-house">Равнодомная система</option>
                <option value="regiomontanus">Региомонтан</option>
                <option value="topocentric">Топоцентрическая</option>
              </select>
            </div>
          </div>

          {/* Кнопка отправки */}
          <button
            type="submit"
            className="mt-6 w-full p-3 bg-[#7D58C6] text-white font-medium rounded-md hover:bg-gray-800 transition"
          >
            Построить карту
          </button>
        </form>

        {/* Отображение введенных данных */}
        {submittedData && (
          <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
            <h3 className="text-lg font-medium">Введенные данные:</h3>
            <p><strong>Имя:</strong> {submittedData.name}</p>
            <p><strong>Дата, время (часовой пояс):</strong> {submittedData.date}, {submittedData.time} ({submittedData.utcOffset})</p>
            <p><strong>Город:</strong> {submittedData.city}</p>
            <p><strong>Система домов:</strong> {houseSystemNames[submittedData.houseSystem]}</p>
          </div>
        )}
      </div>
    </div>
  );
}
