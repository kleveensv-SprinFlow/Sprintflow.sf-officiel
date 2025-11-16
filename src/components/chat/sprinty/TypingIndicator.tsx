import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 p-2">
      <motion.div
        className="w-2 h-2 bg-gray-400 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-400 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.8, delay: 0.1, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="w-2 h-2 bg-gray-400 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default TypingIndicator;
