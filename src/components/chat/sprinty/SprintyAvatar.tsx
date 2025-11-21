import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sprintyData } from './sprintyData';
import { SprintyExpression, useSprinty } from '../../../context/SprintyContext';

interface SprintyAvatarProps {
  className?: string;
  onClick?: () => void;
  scale?: number;
}

const SprintyAvatar: React.FC<SprintyAvatarProps> = ({
  className = '',
  onClick,
  scale = 1,
}) => {
  const { expression } = useSprinty();

  // Map expressions "alias" vers les clés réelles du dataset
  const getDataKey = (
    expr: SprintyExpression,
  ): keyof typeof sprintyData.expressions => {
    if (expr === 'happy') return 'success';
    if (expr === 'thinking') return 'perplexed';
    if (expr === 'typing') return 'neutral';
    return (expr as keyof typeof sprintyData.expressions) || 'neutral';
  };

  const dataKey = getDataKey(expression);
  const currentData =
    sprintyData.expressions[dataKey] || sprintyData.expressions.neutral;

  // Styles de bouche calqués sur les SVG d’origine
  const mouthStyles: Record<
    keyof typeof sprintyData.expressions,
    { fill?: string; stroke?: string; strokeWidth?: number }
  > = {
    neutral: { fill: '#B2B2B3' }, // 1_neutral.svg
    success: { fill: '#B2B2B3' }, // 2_success.svg
    sleep: { fill: '#B2B2B3' },   // 6_sleep.svg
    perplexed: { fill: '#8B3033', stroke: 'black', strokeWidth: 8 }, // 3_perplexed.svg
    caution: { fill: '#8B3033', stroke: 'black', strokeWidth: 8 },   // bouche marquée
    frustrated: { fill: '#8B3033', stroke: 'black', strokeWidth: 8 },// bouche marquée
  };

  const mouthStyle = mouthStyles[dataKey] ?? mouthStyles.neutral;

  // Animation de respiration (léger mouvement vertical du visage)
  const breathingVariants = {
    idle: {
      y: [0, -2, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Animation de clignement pour les yeux (squash vertical du groupe)
  const blinkVariants = {
    blink: {
      scaleY: [1, 0.1, 1],
      transition: {
        duration: 0.3,
        times: [0, 0.5, 1],
        repeat: Infinity,
        repeatDelay: 4,
      },
    },
  };

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
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
        {/* CLIP POUR LES YEUX (permet de garder la pupille à l’intérieur du blanc) */}
        <defs>
          <clipPath id="clip_eye_R">
            <path d={currentData.eyeR.white} />
          </clipPath>
          <clipPath id="clip_eye_L">
            <path d={currentData.eyeL.white} />
          </clipPath>
        </defs>

        {/* --- COUCHE STATIQUE : VISAGE EXACT D’ORIGINE --- */}

        {/* Oreilles derrière la tête */}
        <g id="ears">
          {/* Oreille droite */}
          <g id="ear_R">
            <path
              d={sprintyData.base.earR.outer}
              fill="#C8C8C8"
              stroke="black"
              strokeWidth={8}
            />
            <path
              d={sprintyData.base.earR.inner}
              fill="#465560"
              stroke="black"
              strokeWidth={6}
            />
            <path
              d={sprintyData.base.earR.highlight}
              fill="#EBECED"
              opacity={0.55}
            />
            <path
              d={sprintyData.base.earR.innerShadow}
              fill="black"
              fillOpacity={0.26}
            />
            <path
              d={sprintyData.base.earR.outerShadow}
              fill="black"
              fillOpacity={0.26}
            />
          </g>
          {/* Oreille gauche */}
          <g id="ear_L">
            <path
              d={sprintyData.base.earL.outer}
              fill="#C8C8C8"
              stroke="black"
              strokeWidth={8}
            />
            <path
              d={sprintyData.base.earL.inner}
              fill="#465560"
              stroke="black"
              strokeWidth={6}
            />
            <path
              d={sprintyData.base.earL.highlight}
              fill="#EBECED"
              opacity={0.55}
            />
            <path
              d={sprintyData.base.earL.innerShadow}
              fill="black"
              fillOpacity={0.26}
            />
            <path
              d={sprintyData.base.earL.outerShadow}
              fill="black"
              fillOpacity={0.26}
            />
          </g>
        </g>

        {/* Petits poils d’oreilles */}
        <path d={sprintyData.base.earR.hair} fill="black" />
        <path d={sprintyData.base.earL.hair} fill="black" />

        {/* Tête / visage de base */}
        <g id="head-group">
          <path
            d={sprintyData.base.head}
            fill="#C8C8C8"
            stroke="black"
            strokeWidth={8}
          />
          <path d={sprintyData.base.headShadow} fill="#B0B0B1" />
          <path d={sprintyData.base.headShadowL} fill="#EBECED" />
          <path d={sprintyData.base.headShadowR} fill="#EBECE8" />

          {/* Taches de pelage */}
          <g id="spots">
            {sprintyData.base.spots.map((d, i) => (
              <path key={i} d={d} fill="#485760" />
            ))}
          </g>

          {/* Zones plus claires autour des yeux */}
          <path d={sprintyData.base.eyeSpotR} fill="#E0E1E1" />
          <path d={sprintyData.base.eyeSpotL} fill="#E0E1E1" />
        </g>

        {/* Casquette */}
        <g id="cap">
          <path
            d={sprintyData.base.cap.top}
            fill="#5D7A9C"
            stroke="black"
            strokeWidth={6}
          />
          <path
            d={sprintyData.base.cap.side}
            fill="#32455D"
            stroke="black"
            strokeWidth={6}
          />
          <path
            d={sprintyData.base.cap.front}
            fill="#32455D"
            stroke="black"
            strokeWidth={6}
          />
          <path
            d={sprintyData.base.cap.shade}
            fill="#32455D"
            stroke="black"
            strokeWidth={6}
          />
          <path
            d={sprintyData.base.cap.shadeInner}
            fill="#253345"
            stroke="black"
            strokeWidth={6}
          />
          <path
            d={sprintyData.base.cap.shadeInnerLine}
            stroke="black"
            strokeWidth={6}
            strokeLinecap="round"
          />
          <path d={sprintyData.base.cap.highlightR} fill="#587295" />
          <path
            d={sprintyData.base.cap.logo54}
            fill="#FBFAF8"
            stroke="#FBFAF8"
          />
        </g>

        {/* Bas du visage / menton, nez, moustaches */}
        <g id="face-base">
          <path d={sprintyData.base.chin} fill="#E0DFDF" />
          <path d={sprintyData.base.chinShadow} fill="#B0B0B1" />
          <path d={sprintyData.base.chinDark} fill="black" />

          <g id="nose">
            {sprintyData.base.nose.map((d, i) => (
              <path
                key={i}
                d={d}
                fill={i === 1 ? '#C2A4A3' : 'black'}
                stroke={i < 2 || i === 3 ? 'black' : 'none'}
              />
            ))}
          </g>

          <g id="whiskers">
            {sprintyData.base.whiskers.map((d, i) => (
              <path key={i} d={d} fill="black" />
            ))}
          </g>
        </g>

        {/* Ombres supplémentaires de la casquette */}
        <path d={sprintyData.base.cap.shadeHighlight} fill="#587295" />
        <path
          d={sprintyData.base.cap.shadowL}
          fill="black"
          fillOpacity={0.26}
        />
        <path d={sprintyData.base.cap.vector11} fill="#587295" />
        <path
          d={sprintyData.base.cap.headShadow}
          fill="black"
          fillOpacity={0.16}
        />

        {/* --- COUCHE DYNAMIQUE : YEUX + BOUCHE + ACCESSOIRES --- */}
        <AnimatePresence mode="wait">
          <motion.g
            key={dataKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Œil droit */}
            <motion.g
              id="eye_R_dynamic"
              variants={blinkVariants}
              animate="blink"
              style={{ transformOrigin: '353px 620px' }}
            >
              <path d={currentData.eyeR.outer} fill="#020201" />
              <path d={currentData.eyeR.white} fill="white" />
              <g clipPath="url(#clip_eye_R)">
                {currentData.eyeR.pupil.base && (
                  <circle
                    cx={currentData.eyeR.pupil.base.cx}
                    cy={currentData.eyeR.pupil.base.cy}
                    r={currentData.eyeR.pupil.base.r}
                    fill={currentData.eyeR.pupil.base.fill}
                  />
                )}
                {currentData.eyeR.pupil.cyan && (
                  <path d={currentData.eyeR.pupil.cyan} fill="#34DCED" />
                )}
                {currentData.eyeR.pupil.black && (
                  <path d={currentData.eyeR.pupil.black} fill="black" />
                )}
                {currentData.eyeR.pupil.highlightUpper && (
                  <path
                    d={currentData.eyeR.pupil.highlightUpper}
                    fill="#F0EFEF"
                  />
                )}
                {currentData.eyeR.pupil.highlightLower && (
                  <path
                    d={currentData.eyeR.pupil.highlightLower}
                    fill="#F0EFEF"
                  />
                )}
                {currentData.eyeR.eyeBallShadow && (
                  <path
                    d={currentData.eyeR.eyeBallShadow}
                    fill="black"
                    fillOpacity={0.28}
                  />
                )}
              </g>
            </motion.g>

            {/* Œil gauche */}
            <motion.g
              id="eye_L_dynamic"
              variants={blinkVariants}
              animate="blink"
              style={{ transformOrigin: '671px 620px' }}
            >
              <path d={currentData.eyeL.outer} fill="#020201" />
              <path d={currentData.eyeL.white} fill="white" />
              <g clipPath="url(#clip_eye_L)">
                {currentData.eyeL.pupil.base && (
                  <circle
                    cx={currentData.eyeL.pupil.base.cx}
                    cy={currentData.eyeL.pupil.base.cy}
                    r={currentData.eyeL.pupil.base.r}
                    fill={currentData.eyeL.pupil.base.fill}
                  />
                )}
                {currentData.eyeL.pupil.cyan && (
                  <path d={currentData.eyeL.pupil.cyan} fill="#34DCED" />
                )}
                {currentData.eyeL.pupil.black && (
                  <path d={currentData.eyeL.pupil.black} fill="black" />
                )}
                {currentData.eyeL.pupil.highlightUpper && (
                  <path
                    d={currentData.eyeL.pupil.highlightUpper}
                    fill="#F0EFEF"
                  />
                )}
                {currentData.eyeL.pupil.highlightLower && (
                  <path
                    d={currentData.eyeL.pupil.highlightLower}
                    fill="#F0EFEF"
                  />
                )}
                {currentData.eyeL.eyeBallShadow && (
                  <path
                    d={currentData.eyeL.eyeBallShadow}
                    fill="black"
                    fillOpacity={0.28}
                  />
                )}
              </g>
            </motion.g>

            {/* Bouche : d identique aux SVG + style dérivé des SVG */}
            <path d={currentData.mouth} {...mouthStyle} />

            {/* Langue (présente uniquement sur certaines expressions) */}
            {currentData.tongue && (
              <path d={currentData.tongue} fill="#E2313C" />
            )}

            {/* Joues rosées (success) */}
            {currentData.cheeks && (
              <>
                <ellipse
                  opacity={0.59}
                  cx={736.5}
                  cy={665}
                  rx={71.5}
                  ry={52}
                  fill="#FF98B1"
                />
                <ellipse
                  opacity={0.59}
                  cx={331.5}
                  cy={702}
                  rx={71.5}
                  ry={52}
                  fill="#FF98B1"
                />
              </>
            )}

            {/* Points d’interrogation (perplexed) */}
            {currentData.questionMarks && (
              <g>
                <circle
                  cx={797.04}
                  cy={361.754}
                  r={14.684}
                  fill="#EEEEEE"
                  stroke="black"
                  strokeWidth={4}
                />
                <circle
                  cx={756.386}
                  cy={396.86}
                  r={10.3864}
                  fill="#EEEEEE"
                  stroke="black"
                  strokeWidth={3}
                />
                <circle
                  cx={830.466}
                  cy={301.335}
                  r={24.4178}
                  fill="#EEEEEE"
                  stroke="black"
                  strokeWidth={6}
                />
              </g>
            )}

            {/* Éclairs (caution) */}
            {currentData.shock && (
              <g id="shock-marks">
                <path
                  d="M889.575 280.802L969.059 166.136L896.089 231.287L873.938 189.59L782.727 329.014L866.12 232.59L889.575 280.802Z"
                  fill="#F5D300"
                />
                <path
                  d="M91.5347 411.321L11.6072 296.88L86.0849 369.541L106.384 336.157L206.842 477.24L114.459 374.256L91.5347 411.321Z"
                  fill="#F5D300"
                />
              </g>
            )}

            {/* ZZZ (sleep) */}
            {currentData.zzz && (
              <g id="zzz">
                <path
                  d="M660 164L727.5 149L679 226.5L744.5 209.5"
                  stroke="white"
                  strokeWidth={20}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M752 86L819.5 71L771 148.5L836.5 131.5"
                  stroke="white"
                  strokeWidth={20}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}
          </motion.g>
        </AnimatePresence>
      </motion.svg>
    </motion.div>
  );
};

export default SprintyAvatar;
