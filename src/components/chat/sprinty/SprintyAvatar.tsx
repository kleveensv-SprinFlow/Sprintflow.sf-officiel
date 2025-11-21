import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sprintyData } from './sprintyData';
import { SprintyExpression, useSprinty } from '../../../context/SprintyContext';

interface SprintyAvatarProps {
  className?: string;
  onClick?: () => void;
  scale?: number;
}

const SprintyAvatar: React.FC<SprintyAvatarProps> = ({ className = '', onClick, scale = 1 }) => {
  const { expression } = useSprinty();

  // Mapping expressions to data keys (handling aliases)
  const getDataKey = (expr: SprintyExpression): keyof typeof sprintyData.expressions => {
    if (expr === 'happy') return 'success';
    if (expr === 'thinking') return 'perplexed';
    if (expr === 'typing') return 'neutral'; // Base for typing, handled with animation
    return expr as keyof typeof sprintyData.expressions || 'neutral';
  };

  const dataKey = getDataKey(expression);
  const currentData = sprintyData.expressions[dataKey];

  // Idle breathing animation
  const breathingVariants = {
    idle: {
      y: [0, -2, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Blinking animation for eyes
  const blinkVariants = {
    blink: {
      scaleY: [1, 0.1, 1],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatDelay: 4
      }
    }
  };

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: scale }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: scale * 1.05 }}
      whileTap={{ scale: scale * 0.95 }}
    >
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 1024 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={breathingVariants}
        animate="idle"
      >
        {/* Base Head */}
        <g id="sprinty-base">
          <path d={sprintyData.base.head} fill="#C8C8C8" stroke="black" strokeWidth="8" />
          <path d={sprintyData.base.headShadow} fill="#B0B0B1" />
          {/* Cap */}
          <g id="cap">
            <path d={sprintyData.base.cap.top} fill="#5D7A9C" stroke="black" strokeWidth="6" />
            <path d={sprintyData.base.cap.side} fill="#32455D" stroke="black" strokeWidth="6" />
            <path d={sprintyData.base.cap.front} fill="#32455D" stroke="black" strokeWidth="6" />
            <path d={sprintyData.base.cap.shade} fill="#32455D" stroke="black" strokeWidth="6" />
            <path d={sprintyData.base.cap.logo54} fill="#FBFAF8" stroke="#FBFAF8" />
          </g>
        </g>

        {/* Dynamic Face */}
        <AnimatePresence mode="wait">
          <motion.g
            key={dataKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Right Eye */}
            <g id="eye_R">
              <motion.g variants={blinkVariants} animate="blink">
                <path d={currentData.eyeR.outer} fill="#020201" />
                <path d={currentData.eyeR.white} fill="white" />
                <g>
                   {currentData.eyeR.pupil.cyan && <path d={currentData.eyeR.pupil.cyan} fill="#1097AF" />}
                   {currentData.eyeR.pupil.black && <path d={currentData.eyeR.pupil.black} fill="black" />}
                </g>
              </motion.g>
            </g>

            {/* Left Eye */}
            <g id="eye_L">
              <motion.g variants={blinkVariants} animate="blink">
                <path d={currentData.eyeL.outer} fill="#020201" />
                <path d={currentData.eyeL.white} fill="white" />
                <g>
                   {currentData.eyeL.pupil.cyan && <path d={currentData.eyeL.pupil.cyan} fill="#1097AF" />}
                   {currentData.eyeL.pupil.black && <path d={currentData.eyeL.pupil.black} fill="black" />}
                </g>
              </motion.g>
            </g>

            {/* Mouth */}
            <path d={currentData.mouth} fill={expression === 'neutral' ? '#B2B2B3' : expression === 'happy' ? '#B2B2B3' : '#8B3033'} stroke={expression === 'perplexed' ? 'none' : 'black'} strokeWidth={expression === 'perplexed' ? '0' : '0'} />
            {currentData.tongue && <path d={currentData.tongue} fill="#E2313C" />}

            {/* Accessories/Extras */}
            {currentData.cheeks && (
               <>
                 <ellipse opacity="0.59" cx="736.5" cy="665" rx="71.5" ry="52" fill="#FF98B1" />
                 <ellipse opacity="0.59" cx="331.5" cy="702" rx="71.5" ry="52" fill="#FF98B1" />
               </>
            )}
            
            {/* Question Marks for Perplexed */}
            {currentData.questionMarks && (
               <g>
                 <circle cx="797.04" cy="361.754" r="14.684" fill="#EEEEEE" stroke="black" strokeWidth="4"/>
                 <circle cx="756.386" cy="396.86" r="10.3864" fill="#EEEEEE" stroke="black" strokeWidth="3"/>
                 <circle cx="830.466" cy="301.335" r="24.4178" fill="#EEEEEE" stroke="black" strokeWidth="6"/>
               </g>
            )}

            {/* Shock for Caution */}
            {currentData.shock && (
                <g id="shock-marks">
                    <path d="M889.575 280.802L969.059 166.136L896.089 231.287L873.938 189.59L782.727 329.014L866.12 232.59L889.575 280.802Z" fill="#F5D300"/>
                    <path d="M91.5347 411.321L11.6072 296.88L86.0849 369.541L106.384 336.157L206.842 477.24L114.459 374.256L91.5347 411.321Z" fill="#F5D300"/>
                </g>
            )}

            {/* ZZZ for Sleep */}
            {currentData.zzz && (
                <g id="zzz">
                    <path d="M660 164L727.5 149L679 226.5L744.5 209.5" stroke="white" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M752 86L819.5 71L771 148.5L836.5 131.5" stroke="white" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
            )}

          </motion.g>
        </AnimatePresence>
      </motion.svg>
    </motion.div>
  );
};

export default SprintyAvatar;
