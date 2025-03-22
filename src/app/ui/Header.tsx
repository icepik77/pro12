import Link from "next/link";
import Image from "next/image";
import logo from "@/../public/logo.png";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white mb-[12px] max-w-screen-lg mx-auto border-b-2 border-gray-300">
      
      {/* Логотип */}
      <div>
        <Image src={logo} alt="Логотип" width={350} height={350} />
      </div>

      {/* Кнопка входа */}
      <Link href="">
        <button className="py-2 px-4 bg-[#172935] text-white font-medium rounded-md hover:bg-gray-800 transition">
          Вход
        </button>
      </Link>
    </header>
  );
};

export default Header;
