import Link from "next/link";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md mb-[12px]">
      {/* Название Академии вместо логотипа */}
      <div className="flex flex-col items-center text-center text-[#7D58C6] font-bold text-lg leading-tight">
        <span>Академия</span>
        <span>астрологии</span>
      </div>

      {/* Кнопка входа */}
      <Link href="/login">
        <button className="py-2 px-4 bg-[#7D58C6] text-white font-medium rounded-md hover:bg-gray-800 transition">
          Вход
        </button>
      </Link>
    </header>
  );
};

export default Header;
