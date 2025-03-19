'use client';

import { useState } from "react";

// Функция для поиска городов с использованием Nominatim API
async function searchCities(query: string) {
  if (!query) return [];
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`);
  const data = await response.json();
  return data || [];
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

// Словарь для выбора оформления
const styleOptions = [
  { value: "heavenly", label: "Небесная" },
  { value: "management", label: "Управление" },
  { value: "elements", label: "Стихии" },
];

interface BirthFormProps {
  setBirthData: (data: any) => void;
  localTime?: string;
}

export default function BirthForm({ setBirthData, localTime }: BirthFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    city: "",
    latitude: "",
    longitude: "",
    utcOffset: "",
    houseSystem: "koch",
    style: "elements", // Новый выбор для оформления
  });

  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);

  // Валидация координат
  const validateCoordinates = (lat: string, lon: string) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    return (
      !isNaN(latitude) && latitude >= -90 && latitude <= 90 &&
      !isNaN(longitude) && longitude >= -180 && longitude <= 180
    );
  };

  // Валидация часового пояса
  const validateUtcOffset = (offset: string) => {
    // Если строка пуста, то считаем, что это допустимо
    if (offset === "") {
      return true;
    }

    // Проверяем, что часовой пояс в правильном формате
    const regex = /^([+-])([01]?\d|2[0-3]):([0-5]?\d)$/;
    return regex.test(offset);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const city = e.target.value;
    setFormData({ ...formData, city });

    if (city.length > 2) {
      const suggestions = await searchCities(city);
      setCitySuggestions(suggestions);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleCitySelect = (city: any) => {
    setFormData({
      ...formData,
      city: city.display_name,
      latitude: city.lat,
      longitude: city.lon,
    });
    setCitySuggestions([]);
  };

  const handleCityClear = () => {
    setFormData({
      ...formData,
      city: "",
      latitude: "",
      longitude: "",
    });
    setCitySuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем координаты
    if (!validateCoordinates(formData.latitude, formData.longitude)) {
      alert("Ошибка: Введите корректные координаты!");
      return;
    }

    // Проверяем часовой пояс
    if (!validateUtcOffset(formData.utcOffset)) {
      alert("Ошибка: Введите корректный часовой пояс в формате UTC±hh:mm");
      return;
    }

    setBirthData(formData);
    setSubmittedData(formData);
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
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" />
            </div>

            {/* Дата */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Дата рождения</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" />
            </div>

            {/* Время */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Время рождения</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" />
            </div>

            {/* Город */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Город рождения (необязательно)</label>
              <div className="relative">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleCityChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none pr-10"
                />
                {formData.city && (
                  <button
                    type="button"
                    onClick={handleCityClear}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    &#10005;
                  </button>
                )}
              </div>
              {citySuggestions.length > 0 && (
                <ul className="border border-gray-300 mt-2 max-h-48 overflow-y-auto bg-white">
                  {citySuggestions.map((city, index) => (
                    <li key={index} onClick={() => handleCitySelect(city)} className="p-2 cursor-pointer hover:bg-gray-200">
                      {city.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Широта */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Широта</label>
              <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Введите широту вручную" className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" />
            </div>

            {/* Долгота */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Долгота</label>
              <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Введите долготу вручную" className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" />
            </div>

            {/* Часовой пояс */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Часовой пояс (UTC)</label>
              <input type="text" name="utcOffset" value={formData.utcOffset} onChange={handleChange} placeholder={localTime || "+00:00"} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" />
            </div>

            {/* Система домов */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Система домов</label>
              <select name="houseSystem" value={formData.houseSystem} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none">
                {Object.entries(houseSystemNames).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Выбор оформления */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Выбор оформления</label>
              <select name="style" value={formData.style} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none">
                {styleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="mt-6 w-full p-3 bg-[#7D58C6] text-white font-medium rounded-md hover:bg-gray-800 transition">Построить карту</button>
        </form>

        {submittedData && (
          <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
            <h3 className="text-lg font-medium">Введенные данные:</h3>
            <p><strong>Имя:</strong> {submittedData.name}</p>
            <p><strong>Дата, время (часовой пояс):</strong> {submittedData.date}, {submittedData.time} ({submittedData.utcOffset || localTime})</p>
            <p><strong>Город:</strong> {submittedData.city}</p>
            <p><strong>Широта:</strong> {submittedData.latitude}</p>
            <p><strong>Долгота:</strong> {submittedData.longitude}</p>
            <p><strong>Система домов:</strong> {houseSystemNames[submittedData.houseSystem]}</p>
            <p><strong>Оформление:</strong> {styleOptions.find(option => option.value === submittedData.style)?.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}
