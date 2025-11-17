import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <div className="flex items-end gap-2 justify-start ml-10">
      <div className="px-4 py-3 rounded-2xl bg-light-card dark:bg-dark-card shadow-md">
        <motion.div
          className="flex items-center space-x-1.5"
          initial="initial"
          animate="animate"
          variants={{
            initial: {},
            animate: { transition: { staggerChildren: 0.2 } },
          }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              variants={{
                initial: { y: 0, opacity: 0.5 },
                animate: {
                  y: [0, -4, 0],
                  opacity: [0.5, 1, 0.5],
                  transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
                },
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TypingIndicator;
