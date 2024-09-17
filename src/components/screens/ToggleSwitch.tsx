import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

const ToggleSwitch = ({ isActive, onToggle }) => {
  const [position, setPosition] = useState({ left: 0, width: 0 });

  const ref = useRef(null);

  return (
    <div className="relative flex items-center space-x-4">
      <span className="text-red-700 text-2xl">Join</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isActive}
          onChange={onToggle}
        />
        <div
          ref={ref}
          onMouseEnter={() => {
            if (!ref.current) return;
            const { width, offsetLeft } = ref.current.getBoundingClientRect();
            setPosition({
              left: offsetLeft,
              width,
            });
          }}
          className="peer bg-gray-300 rounded-full relative w-16 h-8 shadow-inner transition-colors duration-300"
        >
          <motion.div
            className={`absolute inset-0 rounded-full transition-transform duration-300 ${
              isActive ? "bg-green-500 translate-x-full" : "bg-red-500"
            }`}
            style={{ width: position.width, left: position.left }}
          />
        </div>
      </label>
      <span className="text-green-700 text-2xl">Create</span>
    </div>
  );
};

export default ToggleSwitch;
