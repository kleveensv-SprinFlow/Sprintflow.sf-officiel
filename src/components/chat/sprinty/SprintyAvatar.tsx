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

  // Mapping expressions to data keys
  const getDataKey = (expr: SprintyExpression): keyof typeof sprintyData.expressions => {
    if (expr === 'happy') return 'success';
    if (expr === 'thinking') return 'perplexed';
    if (expr === 'typing') return 'neutral'; 
    return expr as keyof typeof sprintyData.expressions || 'neutral';
  };

  const dataKey = getDataKey(expression);
  // Fallback to neutral if specific expression data is missing (since we only fully populated neutral/success etc in this step)
  const currentData = sprintyData.expressions[dataKey] || sprintyData.expressions.neutral;

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
        {/* --- STATIC BASE LAYER --- */}
        
        {/* Ears (Behind Head) */}
        <g id="ears">
            {/* Right Ear */}
            <g id="ear_R">
                <path d={sprintyData.base.earR.outer} fill="#C8C8C8" stroke="black" strokeWidth="8" />
                <path d={sprintyData.base.earR.inner} fill="#465560" stroke="black" strokeWidth="6" />
                <path d={sprintyData.base.earR.highlight} fill="#EBECED" opacity="0.55" />
                <path d={sprintyData.base.earR.innerShadow} fill="black" fillOpacity="0.26" />
                <path d={sprintyData.base.earR.outerShadow} fill="black" fillOpacity="0.26" />
            </g>
             {/* Left Ear */}
            <g id="ear_L">
                <path d={sprintyData.base.earL.outer} fill="#C8C8C8" stroke="black" strokeWidth="8" />
                <path d={sprintyData.base.earL.inner} fill="#465560" stroke="black" strokeWidth="6" />
                <path d={sprintyData.base.earL.highlight} fill="#EBECED" opacity="0.55" />
                <path d={sprintyData.base.earL.innerShadow} fill="black" fillOpacity="0.26" />
                <path d={sprintyData.base.earL.outerShadow} fill="black" fillOpacity="0.26" />
            </g>
        </g>

        {/* Ear Hair (Behind Head but in front of ears?) - SVG order puts them after ears */}
        <path d={sprintyData.base.earR.hair} fill="black" />
        <path d={sprintyData.base.earL.hair} fill="black" />

        {/* Head Base */}
        <g id="head-group">
          <path d={sprintyData.base.head} fill="#C8C8C8" stroke="black" strokeWidth="8" />
          <path d={sprintyData.base.headShadow} fill="#B0B0B1" />
          <path d={sprintyData.base.headShadowL} fill="#EBECED" />
          <path d={sprintyData.base.headShadowR} fill="#EBECE8" />
          
          {/* Spots */}
          <g id="spots">
              {sprintyData.base.spots.map((d, i) => (
                  <path key={i} d={d} fill="#485760" />
              ))}
          </g>
          
          {/* Eye Spots (Base) */}
          <path d={sprintyData.base.eyeSpotR} fill="#E0E1E1" />
          <path d={sprintyData.base.eyeSpotL} fill="#E0E1E1" />
        </g>

        {/* --- CAP LAYER (Behind Face details?) No, Cap is usually on top of head base but behind face features? 
            In SVG: Head -> Spots -> Eye Spots -> Cap -> Face Features. Let's follow that order. 
        */}
        <g id="cap">
            <path d={sprintyData.base.cap.top} fill="#5D7A9C" stroke="black" strokeWidth="6" />
            <path d={sprintyData.base.cap.side} fill="#32455D" stroke="black" strokeWidth="6" />
            <path d={sprintyData.base.cap.front} fill="#32455D" stroke="black" strokeWidth="6" />
            <path d={sprintyData.base.cap.shade} fill="#32455D" stroke="black" strokeWidth="6" />
            <path d={sprintyData.base.cap.shadeInner} fill="#253345" stroke="black" strokeWidth="6" />
            <path d={sprintyData.base.cap.shadeInnerLine} stroke="black" strokeWidth="6" strokeLinecap="round" />
            <path d={sprintyData.base.cap.highlightR} fill="#587295" />
            <path d={sprintyData.base.cap.logo54} fill="#FBFAF8" stroke="#FBFAF8" />
        </g>

        {/* --- FACE BASE (Chin, Nose, Whiskers) --- */}
        <g id="face-base">
            <path d={sprintyData.base.chin} fill="#E0DFDF" />
            <path d={sprintyData.base.chinShadow} fill="#B0B0B1" />
            <path d={sprintyData.base.chinDark} fill="black" />
            
            {/* Nose */}
            <g id="nose">
                {sprintyData.base.nose.map((d, i) => (
                    <path key={i} d={d} fill={i===1 ? "#C2A4A3" : "black"} stroke={i < 2 || i===3 ? "black" : "none"} />
                ))}
            </g>

            {/* Whiskers */}
            <g id="whiskers">
                {sprintyData.base.whiskers.map((d, i) => (
                    <path key={i} d={d} fill="black" />
                ))}
            </g>
        </g>

        {/* --- CAP TOP LAYERS (Shadows over head) --- */}
        <path d={sprintyData.base.cap.shadeHighlight} fill="#587295" />
        <path d={sprintyData.base.cap.shadowL} fill="black" fillOpacity="0.26" />
        <path d={sprintyData.base.cap.vector11} fill="#587295" />
        <path d={sprintyData.base.cap.headShadow} fill="black" fillOpacity="0.16" />


        {/* --- DYNAMIC EXPRESSION LAYER --- */}
        <AnimatePresence mode="wait">
          <motion.g
            key={dataKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Right Eye */}
            <g id="eye_R_dynamic">
              <path d={currentData.eyeR.outer} fill="#020201" />
              <path d={currentData.eyeR.white} fill="white" />
              {/* Masking usually needed here, but for simplicity we layer pupil on top if it fits, 
                  or we'd need to implement SVG masks. 
                  Given the complexity, we'll try layering. 
                  The SVG uses masks. To do this properly in React without defs clutter, 
                  we might need <defs> with mask. 
              */}
              <motion.g variants={blinkVariants} animate="blink" style={{ originY: "650px" }}> 
                  {/* Pupil Group */}
                  <g>
                      {currentData.eyeR.pupil.cyan && <path d={currentData.eyeR.pupil.cyan} fill="#1097AF" />}
                      {currentData.eyeR.pupil.black && <path d={currentData.eyeR.pupil.black} fill="black" />}
                      {currentData.eyeR.pupil.highlightUpper && <path d={currentData.eyeR.pupil.highlightUpper} fill="#F0EFEF" />}
                      {currentData.eyeR.pupil.highlightLower && <path d={currentData.eyeR.pupil.highlightLower} fill="#F0EFEF" />}
                  </g>
                  <path d={currentData.eyeR.eyeBallShadow} fill="black" fillOpacity="0.28" />
              </motion.g>
            </g>

            {/* Left Eye */}
            <g id="eye_L_dynamic">
              <path d={currentData.eyeL.outer} fill="#020201" />
              <path d={currentData.eyeL.white} fill="white" />
              <motion.g variants={blinkVariants} animate="blink" style={{ originY: "650px" }}>
                  <g>
                      {currentData.eyeL.pupil.cyan && <path d={currentData.eyeL.pupil.cyan} fill="#1097AF" />}
                      {currentData.eyeL.pupil.black && <path d={currentData.eyeL.pupil.black} fill="black" />}
                      {currentData.eyeL.pupil.highlightUpper && <path d={currentData.eyeL.pupil.highlightUpper} fill="#F0EFEF" />}
                      {currentData.eyeL.pupil.highlightLower && <path d={currentData.eyeL.pupil.highlightLower} fill="#F0EFEF" />}
                  </g>
                  <path d={currentData.eyeL.eyeBallShadow} fill="black" fillOpacity="0.28" />
              </motion.g>
            </g>

            {/* Mouth */}
            <path 
                d={currentData.mouth} 
                fill={expression === 'neutral' ? '#B2B2B3' : expression === 'happy' ? '#B2B2B3' : '#8B3033'} 
                stroke={expression === 'perplexed' ? 'none' : 'black'} 
                strokeWidth={expression === 'perplexed' ? '0' : '0'} 
            />
            {currentData.tongue && <path d={currentData.tongue} fill="#E2313C" />}

            {/* Accessories */}
            {currentData.cheeks && (
               <>
                 <ellipse opacity="0.59" cx="736.5" cy="665" rx="71.5" ry="52" fill="#FF98B1" />
                 <ellipse opacity="0.59" cx="331.5" cy="702" rx="71.5" ry="52" fill="#FF98B1" />
               </>
            )}
            
            {currentData.questionMarks && (
               <g>
                 <circle cx="797.04" cy="361.754" r="14.684" fill="#EEEEEE" stroke="black" strokeWidth="4"/>
                 <circle cx="756.386" cy="396.86" r="10.3864" fill="#EEEEEE" stroke="black" strokeWidth="3"/>
                 <circle cx="830.466" cy="301.335" r="24.4178" fill="#EEEEEE" stroke="black" strokeWidth="6"/>
               </g>
            )}

            {currentData.shock && (
                <g id="shock-marks">
                    <path d="M889.575 280.802L969.059 166.136L896.089 231.287L873.938 189.59L782.727 329.014L866.12 232.59L889.575 280.802Z" fill="#F5D300"/>
                    <path d="M91.5347 411.321L11.6072 296.88L86.0849 369.541L106.384 336.157L206.842 477.24L114.459 374.256L91.5347 411.321Z" fill="#F5D300"/>
                </g>
            )}

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
