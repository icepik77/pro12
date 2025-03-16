export async function searchCityCoordinates(city: string) {
  try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?city=${city}&format=json&limit=1`);
      const data = await response.json();

      if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const utcOffset = Math.round(lon / 15); // Рассчитываем смещение UTC

          return {
              lat,
              lon,
              utcOffset: `UTC${utcOffset >= 0 ? "+" : ""}${utcOffset}`
          };
      } else {
          console.error("Город не найден");
          return null;
      }
  } catch (error) {
      console.error("Ошибка при получении координат:", error);
      return null;
  }
}
