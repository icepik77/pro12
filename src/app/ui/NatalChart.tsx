'use client'

import { useEffect, useRef } from 'react';
import Chart from '@astrodraw/astrochart';

// Типы для TypeScript, чтобы избежать ошибок


const NatalChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Подождем, пока компонент загрузится и div станет доступным
    if (chartRef.current) {
      const chart = new Chart('paper', 800, 800);

      const data = {
        "planets": {
          "Lilith": [45],        // Лилит на 45 градусе
          "Chiron": [12],        // Хирон на 12 градусе
          "Pluto": [150],        // Плутон на 150 градусе
          "Neptune": [237, 0.3], // Нептун на 237 градусе, с орбитой 0.3
          "Uranus": [85],        // Уран на 85 градусе
          "Saturn": [18, -0.1],  // Сатурн на 18 градусе, с орбитой -0.1
          "Jupiter": [215],      // Юпитер на 215 градусе
          "Mars": [72],          // Марс на 72 градусе
          "Moon": [108],         // Луна на 108 градусе
          "Sun": [125],          // Солнце на 125 градусе
          "Mercury": [185],      // Меркурий на 185 градусе
          "Venus": [298],        // Венера на 298 градусе
          "NNode": [44],         // Северный узел на 44 градусе
          "SNode": [224],        // Южный узел на 224 градусе
          "Fortune": [12]        // Части фортуны на 12 градусе
        },
        "cusps": [
          30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360 // 12 домов
        ]
      };
      // Рисуем натальную карту
      const radix = chart.radix(data);

      radix.aspects();
    
    }
  }, []);

  return (
    <div>
      {/* Контейнер для натальной карты */}
      <div id="paper" ref={chartRef}></div>
    </div>
  );
};

export default NatalChart;
