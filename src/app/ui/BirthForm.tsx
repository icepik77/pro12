'use client';

import { useState } from "react";
import { validateDateTimeUTC} from "../lib/utils";

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
  setLoadAnimation: (value: boolean) => void;
}

export default function BirthForm({ setBirthData, localTime, setLoadAnimation }: BirthFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    date: "01.01.2000",
    time: "17:00:00",
    city: "",
    latitude: "52.53639",
    longitude: "85.20722",
    utcOffset: "",

    localCity: "",
    localLatitude: "",
    localLongitude: "",

    nameComp:"",
    dateComp:"",
    timeComp:"",
    cityComp:"",
    latitudeComp:"",
    longitudeComp:"",
    utcOffsetComp: "",

    timeFore:"12:30:00",
    dateFore:"10.01.2000",
    utcOffsetFore:"",

    houseSystem: "koch",
    style: "elements", // Новый выбор для оформления

    isLocal: false,
    isCompatibility: false,
    isFore: false,
    isForeSlow: false,
    isForeFast: false
  });

  const [isLocal, setIsLocal] = useState(false);
  const [isCompatibility, setIsCompatibility] = useState(false);
  const [isFore, setIsFore] = useState(false);
  const [isForeSlow, setIsForeSlow] = useState(false);
  const [isForeFast, setIsForeFast] = useState(false);


  const [errors, setErrors] = useState({
    latitude: "",
    longitude: "",
    utcOffset: "",
    commonError:""
  });

  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [localCitySuggestions, localSetCitySuggestions] = useState<any[]>([]);
  const [citySuggestionsComp, setCitySuggestionsComp] = useState<any[]>([]);

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
  const handleUtcOffsetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9+-:]/g, ""); // Оставляем только цифры, знаки +, -, и :
  
    // Проверяем, чтобы первый символ был либо +, либо -
    if (value.length === 1 && !["+", "-"].includes(value)) {
      value = ""; // Очищаем, если введен не + или -
    }
  
    // Добавляем двоеточие после двух цифр, если его нет
    if (value.length === 4 && !value.includes(":")) {
      value = `${value.slice(0, 3)}:${value.slice(3)}`;
    } else if (value.length === 4 && value.includes(":")) {
      value = value.slice(0, 3); // Убираем двоеточие
    }

    // Если введено 2 цифры для минут, то форматируем в +hh:mm или -hh:mm
    if (value.length === 6) {
      const [hours, minutes] = value.slice(1).split(":");
      value = `${value[0]}${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    }
  
    // Ограничиваем длину ввода до 6 символов (например, +00:00 или -05:30)
    if (value.length > 6) return;
  
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // Убираем все, кроме цифр
  
    if (value.length > 8) return; // Ограничиваем ввод 8 символами (ДДММГГГГ)
  
    // Убираем точки перед обработкой
    value = value.replace(/\./g, ""); 
  
    let formattedValue = value;
  
    // Если введено хотя бы 2 цифры, вставляем первую точку
    if (value.length > 2) {
      formattedValue = `${value.slice(0, 2)}.${value.slice(2)}`;
    }
  
    // Если введено хотя бы 4 цифры, вставляем вторую точку
    if (value.length > 4) {
      formattedValue = `${formattedValue.slice(0, 5)}.${formattedValue.slice(5)}`;
    }
  
    setFormData((prev) => ({ ...prev, [e.target.name]: formattedValue }));
  };

  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // Оставляем только цифры
  
    if (value.length > 6) return; // Ограничиваем ввод 6 символами (ЧЧММСС)
  
    // Убираем двоеточие перед обработкой
    value = value.replace(/:/g, "");
  
    let formattedValue = value;
  
    // Если введено хотя бы 2 цифры, вставляем двоеточие
    if (value.length > 2) {
      formattedValue = `${value.slice(0, 2)}:${value.slice(2)}`;
    }
  
    // Если введено хотя бы 4 цифры, вставляем второе двоеточие
    if (value.length > 4) {
      formattedValue = `${formattedValue.slice(0, 5)}:${formattedValue.slice(5)}`;
    }
  
    setFormData((prev) => ({ ...prev, [e.target.name]: formattedValue }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [e.target.name]: value });

    // Очистка ошибки при изменении
    setErrors({
      latitude: "",
      longitude: "",
      utcOffset: "",
      commonError: ""
    });
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };
  
    if (name === "latitude" || name === "latitudeComp") {
      const latitude = parseFloat(value);
      newErrors.latitude = isNaN(latitude) || latitude < -90 || latitude > 90 
        ? "Широта должна быть в пределах от -90 до 90" 
        : "";
    }
  
    if (name === "longitude" || name === "longitudeComp") {
      const longitude = parseFloat(value);
      newErrors.longitude = isNaN(longitude) || longitude < -180 || longitude > 180 
        ? "Долгота должна быть в пределах от -180 до 180" 
        : "";
    }

    setErrors(newErrors);
  };

  const localHandleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };
  
    if (name === "localLatitude") {
      const latitude = parseFloat(value);
      newErrors.latitude = isNaN(latitude) || latitude < -90 || latitude > 90 
        ? "Широта должна быть в пределах от -90 до 90" 
        : "";
    }
  
    if (name === "localLongitude") {
      const longitude = parseFloat(value);
      newErrors.longitude = isNaN(longitude) || longitude < -180 || longitude > 180 
        ? "Долгота должна быть в пределах от -180 до 180" 
        : "";
    }

    setErrors(newErrors);
  };
  
  const handleCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const city = e.target.value;

    // Если город не изменился, не выполняем поиск
    if (city === formData.city) return;

    setFormData({ ...formData, [e.target.name]: city });

    if (city.length > 2) {
      const suggestions = await searchCities(city);
      setCitySuggestions(suggestions);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleCityChangeComp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const city = e.target.value;

    // Если город не изменился, не выполняем поиск
    if (city === formData.cityComp) return;

    setFormData({ ...formData, [e.target.name]: city });

    if (city.length > 2) {
      const suggestions = await searchCities(city);
      setCitySuggestionsComp(suggestions);
    } else {
      setCitySuggestionsComp([]);
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

  const handleCitySelectComp = (city: any) => {
    setFormData({
      ...formData,
      cityComp: city.display_name,
      latitudeComp: city.lat,
      longitudeComp: city.lon,
    });
    setCitySuggestionsComp([]);
  };

  const handleLocalCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const city = e.target.value;

    // Если город не изменился, не выполняем поиск
    if (city === formData.localCity) return;

    setFormData({ ...formData, localCity: city });

    if (city.length > 2) {
      const suggestions = await searchCities(city);
      localSetCitySuggestions(suggestions);
    } else {
      localSetCitySuggestions([]);
    }
  };

  const handleLocalCitySelect = (city: any) => {
    setFormData({
      ...formData,
      localCity: city.display_name,
      localLatitude: city.lat,
      localLongitude: city.lon,
    });
    localSetCitySuggestions([]);
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

  const handleCityClearComp = () => {
    setFormData({
      ...formData,
      cityComp: "",
      latitudeComp: "",
      longitudeComp: "",
    });
    setCitySuggestions([]);
  };

  const handleLocalCityClear = () => {
    setFormData({
      ...formData,
      localCity: "",
      localLatitude: "",
      localLongitude: "",
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

    if (formData.localLatitude && formData.localLongitude  && !validateCoordinates(formData.localLatitude, formData.localLongitude)) {
      newErrors.latitude = "Некорректные координаты";
      newErrors.longitude = "Некорректные координаты";
    }

    if (formData.latitudeComp && formData.longitudeComp  && !validateCoordinates(formData.latitudeComp, formData.longitudeComp)) {
      newErrors.latitude = "Некорректные координаты";
      newErrors.longitude = "Некорректные координаты";
    }

    if (!newErrors.latitude && !newErrors.longitude && !newErrors.utcOffset && validateDateTimeUTC(formData.date, formData.time, formData.utcOffset)) {
      if (isLocal && !isFore && !isForeSlow && !isForeFast){
        setBirthData({
          ...formData,

          cityComp: "",
          latitudeComp: "",
          longitudeComp: "",

          isLocal: true
        });
      } else if(isCompatibility){
        setBirthData({
          ...formData,

          localCity: "",
          localLatitude: "",
          localLongitude: "",

          isCompatibility: true
        });

      } else if ((isFore && !isLocal) || (isForeSlow && !isLocal) || (isForeFast && !isLocal)){
        setLoadAnimation(true);
        setBirthData({
          ...formData,

          localCity: "",
          localLatitude: "",
          localLongitude: "",

          cityComp: "",
          latitudeComp: "",
          longitudeComp: "",

          isFore: isFore ? true : false,
          isForeSlow: isForeSlow ? true : false, 
          isForeFast: isForeFast? true : false
        });
      } else if ((isFore && isLocal) || (isForeSlow && isLocal) || (isForeFast && isLocal)){
          setLoadAnimation(true);
          setBirthData({
            ...formData,

            cityComp: "",
            latitudeComp: "",
            longitudeComp: "",

            isFore: isFore ? true : false,
            isForeSlow: isForeSlow ? true : false, 
            isForeFast: isForeFast ? true : false,          
            isLocal: true
          });
      }
      else {
        setBirthData({
          ...formData,

          localCity: "",
          localLatitude: "",
          localLongitude: "",

          cityComp: "",
          latitudeComp: "",
          longitudeComp: "",
        });
      }

      setSubmittedData(formData);

      setErrors(prevErrors => ({
        ...prevErrors,
        commonError: ""
      }));
    }
    else {
      setErrors(prevErrors => ({
        ...prevErrors,
        commonError: "Данные введены некорректно"
      }));
    }
  };

  return (
    <div className="flex flex-col items-center bg-white text-black p-6">
      <div className="max-w-2xl w-full">
        <h2 className="text-3xl font-medium mb-2">Рассчитать натальную карту онлайн</h2>
        <p className="text-gray-500 mb-8">Заполните данные о рождении</p>
        {errors.commonError &&  <p className="text-red-500 text-sm mb-1">{errors.commonError}</p>}

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 max-w-xl">
          <div className="space-y-4">
            <div>
              {/* Имя */}
              <div>
                <label className="block text-gray-700 text-sm mb-1">Имя</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" />
              </div>

              {/* Дата, время и UTC в одну строку */}
              <div className="flex flex-wrap gap-4">
                {/* Дата */}
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-gray-700 text-sm mb-1">Дата рождения</label>
                  <input 
                    type="text" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleDateInput} 
                    placeholder="ДД.ММ.ГГГГ" 
                    className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" 
                  />
                </div>

                {/* Время */}
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-gray-700 text-sm mb-1">Время рождения</label>
                  <input 
                    type="text" 
                    name="time" 
                    value={formData.time} 
                    onChange={handleTimeInput} 
                    placeholder="ЧЧ:ММ" 
                    className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" 
                  />
                </div>


                {/* UTC */}
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-gray-700 text-sm mb-1">UTC</label>
                  <input
                    type="text"
                    name="utcOffset"
                    value={formData.utcOffset}
                    onChange={handleUtcOffsetInput}
                    placeholder={localTime || "+00:00"}
                    className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Широта и долгота в одну строку */}
              <div className="flex flex-wrap gap-4 mt-4">
                {/* Широта */}
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-gray-700 text-sm mb-1">Широта</label>
                  <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} onBlur={handleBlur} placeholder="Введите широту" className={`w-full p-1 border ${errors.latitude ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-black focus:outline-none`} />
                  {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
                </div>

                {/* Долгота */}
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-gray-700 text-sm mb-1">Долгота</label>
                  <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} onBlur={handleBlur} placeholder="Введите долготу" className={`w-full p-1 border ${errors.longitude ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-black focus:outline-none`} />
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
                    className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none pr-10"
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
            </div>
            

            {/* Система домов */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Система домов</label>
              <select name="houseSystem" value={formData.houseSystem} onChange={handleChange} className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none">
                {Object.entries(houseSystemNames).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Выбор оформления */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">Выбор оформления</label>
              <select name="style" value={formData.style} onChange={handleChange} className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none">
                {styleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Чекбокс */}
            {!isCompatibility &&  
              <label className="flex items-center space-x-2 cursor-pointer ">
              <input
                type="checkbox"
                checked={isLocal}
                onChange={() => {
                  setIsLocal(!isLocal)
                  if (isCompatibility) setIsCompatibility(!isCompatibility);
                }}
                className="w-4 h-4"
              />
              <span>Локальная карта</span>
              </label>
            }

            {/* Чекбокс */}
            {!isLocal && !isFore && !isForeSlow && !isForeFast &&
              <label className="flex items-center space-x-2 cursor-pointer ">
              <input
                type="checkbox"
                checked={isCompatibility}
                onChange={() => {
                  setIsCompatibility(!isCompatibility)
                  if (isLocal) setIsLocal(!isLocal);
                  if (isFore) setIsFore(!isFore);
                }}
                className="w-4 h-4"
              />
              <span>Совместимость</span>
              </label>
            }

            {isLocal && (
              <div className=" px-4 py-0 rounded-lg">
                {/* Широта и долгота в одну строку */}
                <div className="flex flex-wrap gap-4">
                  {/* Широта */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-gray-700 text-sm mb-1">Широта</label>
                    <input type="text" name="localLatitude" value={formData.localLatitude} onChange={handleChange} onBlur={localHandleBlur} placeholder="Введите широту" className={`w-full p-1 border ${errors.latitude ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-black focus:outline-none`} />
                    {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
                  </div>

                  {/* Долгота */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-gray-700 text-sm mb-1">Долгота</label>
                    <input type="text" name="localLongitude" value={formData.localLongitude} onChange={handleChange} onBlur={localHandleBlur} placeholder="Введите долготу" className={`w-full p-1 border ${errors.longitude ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-black focus:outline-none`} />
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
                      value={formData.localCity}
                      onChange={handleLocalCityChange}
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none pr-10"
                    />
                    {formData.localCity && (
                      <button
                        type="button"
                        onClick={handleLocalCityClear}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        &#10005;
                      </button>
                    )}
                  </div>
                  {localCitySuggestions.length > 0 && (
                    <ul className="border border-gray-300 mt-2 max-h-48 overflow-y-auto bg-white">
                      {localCitySuggestions.map((city, index) => (
                        <li key={index} onClick={() => handleLocalCitySelect(city)} className="p-2 cursor-pointer hover:bg-gray-200">
                          {city.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {isCompatibility && (
              <div className=" px-4 py-0 rounded-lg">
                {/* Имя */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Имя</label>
                  <input type="text" name="nameComp" value={formData.nameComp} onChange={handleChange} className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" />
                </div>

                {/* Дата, время и UTC в одну строку */}
                <div className="flex flex-wrap gap-4">
                  {/* Дата */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-gray-700 text-sm mb-1">Дата рождения</label>
                    <input 
                      type="text" 
                      name="dateComp" 
                      value={formData.dateComp} 
                      onChange={handleDateInput} 
                      placeholder="ДД.ММ.ГГГГ" 
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" 
                    />
                  </div>

                  {/* Время */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-gray-700 text-sm mb-1">Время рождения</label>
                    <input 
                      type="text" 
                      name="timeComp" 
                      value={formData.timeComp} 
                      onChange={handleTimeInput} 
                      placeholder="ЧЧ:ММ" 
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" 
                    />
                  </div>


                  {/* UTC */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-gray-700 text-sm mb-1">UTC</label>
                    <input
                      type="text"
                      name="utcOffsetComp"
                      value={formData.utcOffsetComp}
                      onChange={handleUtcOffsetInput}
                      placeholder={localTime || "+00:00"}
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Широта и долгота в одну строку */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {/* Широта */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-gray-700 text-sm mb-1">Широта</label>
                    <input type="text" name="latitudeComp" value={formData.latitudeComp} onChange={handleChange} onBlur={handleBlur} placeholder="Введите широту" className={`w-full p-1 border ${errors.latitude ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-black focus:outline-none`} />
                    {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
                  </div>

                  {/* Долгота */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-gray-700 text-sm mb-1">Долгота</label>
                    <input type="text" name="longitudeComp" value={formData.longitudeComp} onChange={handleChange} onBlur={handleBlur} placeholder="Введите долготу" className={`w-full p-1 border ${errors.longitude ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-black focus:outline-none`} />
                    {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
                  </div>
                </div>

                {/* Город */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Город рождения (необязательно)</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cityComp"
                      value={formData.cityComp}
                      onChange={handleCityChangeComp}
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none pr-10"
                    />
                    {formData.city && (
                      <button
                        type="button"
                        onClick={handleCityClearComp}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        &#10005;
                      </button>
                    )}
                  </div>
                  {citySuggestionsComp.length > 0 && (
                    <ul className="border border-gray-300 mt-2 max-h-48 overflow-y-auto bg-white">
                      {citySuggestionsComp.map((city, index) => (
                        <li key={index} onClick={() => handleCitySelectComp(city)} className="p-2 cursor-pointer hover:bg-gray-200">
                          {city.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Чекбокс транзиты*/}
            {(!isCompatibility && !isForeSlow && !isForeFast) &&
              <label className="flex items-center space-x-2 cursor-pointer ">
              <input
                type="checkbox"
                checked={isFore}
                onChange={() => {
                  setIsFore(!isFore)
                  if (isCompatibility) setIsCompatibility(!isCompatibility);
                  if (isForeSlow) setIsForeSlow(!isForeSlow);
                  if (isForeFast) setIsForeFast(!isForeFast);
                }}
                className="w-4 h-4"
              />
              <span>Транзиты</span>
              </label>
            }

            {/* Чекбокс медленная прогрессия */}
            {(!isCompatibility && !isFore && !isForeFast) &&
              <label className="flex items-center space-x-2 cursor-pointer ">
              <input
                type="checkbox"
                checked={isForeSlow}
                onChange={() => {
                  setIsForeSlow(!isForeSlow)
                  if (isCompatibility) setIsCompatibility(!isCompatibility);
                  if (isFore) setIsFore(!isFore);
                  if (isForeFast) setIsForeFast(!isForeFast);
                }}
                className="w-4 h-4"
              />
              <span>Медленная прогрессия</span>
              </label>
            }

            {/* Чекбокс быстрая прогрессия */}
            {(!isCompatibility && !isFore && !isForeSlow) &&
              <label className="flex items-center space-x-2 cursor-pointer ">
              <input
                type="checkbox"
                checked={isForeFast}
                onChange={() => {
                  setIsForeFast(!isForeFast)
                  if (isCompatibility) setIsCompatibility(!isCompatibility);
                  if (isFore) setIsFore(!isFore);
                  if (isForeSlow) setIsForeSlow(!isForeSlow);
                }}
                className="w-4 h-4"
              />
              <span>Быстрая прогрессия</span>
              </label>
            }

            {(isFore || isForeSlow || isForeFast) && (
              <div className=" px-4 py-0 rounded-lg">
                {/* Дата, время и UTC в одну строку */}
                <div className="flex flex-wrap gap-4">
                  {/* Дата */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-gray-700 text-sm mb-1">Дата</label>
                    <input 
                      type="text" 
                      name="dateFore" 
                      value={formData.dateFore} 
                      onChange={handleDateInput} 
                      placeholder="ДД.ММ.ГГГГ" 
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" 
                    />
                  </div>

                  {/* Время */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-gray-700 text-sm mb-1">Время</label>
                    <input 
                      type="text" 
                      name="timeFore" 
                      value={formData.timeFore} 
                      onChange={handleTimeInput} 
                      placeholder="ЧЧ:ММ" 
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none" 
                    />
                  </div>

                  {/* UTC */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-gray-700 text-sm mb-1">UTC</label>
                    <input
                      type="text"
                      name="utcOffsetFore"
                      value={formData.utcOffsetFore}
                      onChange={handleUtcOffsetInput}
                      placeholder={localTime || "+00:00"}
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>                          
              </div>
            )}

            
          </div>

          <button type="submit" className="mt-6 w-full p-3 bg-[#172935] text-white font-medium rounded-md hover:bg-gray-800 transition">Построить карту</button>
        </form>
      </div>
    </div>
  );
}
