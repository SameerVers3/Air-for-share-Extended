import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCode } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import logo from '../../images/logo.png'; // Update with your correct image path

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  const BackFunc = () => {
    navigate("/");
  }

  return (
    <nav className={`relative flex items-center justify-between p-4 shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      {/* Logo */}
      <div className="flex items-center">
        <a onClick={BackFunc} className='cursor-pointer'>
            <img src={logo} alt="Logo" className="w-28 h-16 object-cover mr-3"/>
        </a>
      </div>

      {/* About the Dev Button */}
      <div className='flex justify-center items-center'>
        <button
            title="Save Post"
            className="cursor-pointer flex flex-row gap-x-2 fill-lime-400 bg-lime-950 hover:bg-lime-900 active:border active:border-lime-400 rounded-md duration-100 p-2 ml-4"
        >
            <FaCode className="text-lime-400" size={20} />
            <span className="text-sm text-lime-400 font-bold pr-1">About Dev</span>
        </button>

      </div>
    </nav>
  );
};

export default Navbar;
