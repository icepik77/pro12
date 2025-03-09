'use client'

import { useState } from "react";

export default function BirthForm() {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    city: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted data:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black p-6">
      <div className="max-w-2xl w-full">
        <h2 className="text-4xl font-bold mb-2">Заполните данные о рождении</h2>
        <p className="text-gray-500 mb-8">Чтобы мы могли составить натальную карту</p>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <div className="space-y-4">
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

            <div>
              <label className="block text-gray-700 text-sm mb-1">Место рождения</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full p-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition"
          >
            Let's work together
          </button>
        </form>
      </div>
    </div>
  );
}