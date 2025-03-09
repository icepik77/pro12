'use client'

import { useState } from "react";
import { Menu } from "lucide-react";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
  
    return (
      <nav className="flex items-center justify-between p-4 bg-black text-white">
        <div className="text-xl font-bold">🔮 AstroApp</div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
          <Menu size={24} />
        </button>
        {menuOpen && (
          <div className="absolute top-12 right-4 bg-gray-900 p-4 rounded-lg shadow-lg">
            <ul className="space-y-2">
              <li><a href="#" className="block text-white hover:text-gray-400">Главная</a></li>
              <li><a href="#" className="block text-white hover:text-gray-400">О нас</a></li>
              <li><a href="#" className="block text-white hover:text-gray-400">Контакты</a></li>
            </ul>
          </div>
        )}
      </nav>
    );
  }