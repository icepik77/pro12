import Link from "next/link";
import Image from "next/image";
import logo from "@/../public/logo.jpg"

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md mb-[12px]">
      {/* Логотип слева */}
      <div>
        <Image src={logo} alt="Логотип" width={50} height={50} />
      </div>

      {/* Кнопка входа */}
      <Link href="">
        <button className="py-2 px-4 bg-[#7D58C6] text-white font-medium rounded-md hover:bg-gray-800 transition">
          Вход
        </button>
      </Link>
    </header>
  );
};

export default Header;
