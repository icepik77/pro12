'use client';

import { useState } from "react";

// Функция для поиска городов с использованием Nominatim API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function searchCities(query: string) {
  if (!query) return [];
  await delay(1500); // задержка 1 секунда
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`, {
    headers: {
      'User-Agent': 'NatalChart/1.0 (icepik77@mail.ru)', // обязательно добавьте User-Agent
    }
  });
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

  const [errors, setErrors] = useState({
    latitude: "",
    longitude: "",
    utcOffset: "",
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
    const { name, value } = e.target;
    setFormData({ ...formData, [e.target.name]: value });

    // Очистка ошибки при изменении
    setErrors({
      latitude: "",
      longitude: "",
      utcOffset: "",
    });
  };


  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };
  
    if (name === "latitude") {
      const latitude = parseFloat(value);
      newErrors.latitude = isNaN(latitude) || latitude < -90 || latitude > 90 
        ? "Широта должна быть в пределах от -90 до 90" 
        : "";
    }
  
    if (name === "longitude") {
      const longitude = parseFloat(value);
      newErrors.longitude = isNaN(longitude) || longitude < -180 || longitude > 180 
        ? "Долгота должна быть в пределах от -180 до 180" 
        : "";
    }
  
    if (name === "utcOffset") {
      newErrors.utcOffset = !validateUtcOffset(value) 
        ? "Некорректный формат UTC (пример: +03:00)" 
        : "";
    }
  
    setErrors(newErrors);
  };
  
  
  

  // const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;

  //   if (name === "latitude" || name === "longitude") {
  //     if (!validateCoordinates(formData.latitude, formData.longitude)) {
  //       setErrors({ ...errors, latitude: "Некорректные координаты", longitude: "Некорректные координаты" });
  //     }
  //   }

  //   if (name === "utcOffset") {
  //     if (!validateUtcOffset(value)) {
  //       setErrors({ ...errors, utcOffset: "Некорректный формат UTC (пример: +03:00)" });
  //     }
  //   }
  // };

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

    let newErrors = { latitude: "", longitude: "", utcOffset: "" };

    // Проверяем координаты
    if (!validateCoordinates(formData.latitude, formData.longitude)) {
      newErrors.latitude = "Некорректные координаты";
      newErrors.longitude = "Некорректные координаты";
    }

    // Проверяем часовой пояс
    if (!validateUtcOffset(formData.utcOffset)) {
      newErrors.utcOffset = "Некорректный формат UTC (пример: +03:00)";
    }

    if (!newErrors.latitude && !newErrors.longitude && !newErrors.utcOffset) {
      setBirthData(formData);
      setSubmittedData(formData);
    }

    
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
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" />
            </div>

            {/* Дата, время и UTC в одну строку */}
            <div className="flex flex-wrap gap-4">
              {/* Дата */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-gray-700 text-sm mb-1">Дата рождения</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" />
              </div>

              {/* Время */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-gray-700 text-sm mb-1">Время рождения</label>
                <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" />
              </div>

              {/* UTC */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-gray-700 text-sm mb-1">Часовой пояс (UTC)</label>
                <input type="text" name="utcOffset" value={formData.utcOffset} onChange={handleChange} placeholder={localTime || "+00:00"} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" />
              </div>
            </div>

            {/* Широта и долгота в одну строку */}
            <div className="flex flex-wrap gap-4 mt-4">
              {/* Широта */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-gray-700 text-sm mb-1">Широта</label>
                <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} onBlur={handleBlur} placeholder="Введите широту" className={`w-full p-3 border ${errors.latitude ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-black focus:outline-none`} />
                {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
              </div>

              {/* Долгота */}
              <div className="flex-1 min-w-[120px]">
                <label className="block text-gray-700 text-sm mb-1">Долгота</label>
                <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} onBlur={handleBlur} placeholder="Введите долготу" className={`w-full p-3 border ${errors.longitude ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-black focus:outline-none`} />
                {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
              </div>
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
