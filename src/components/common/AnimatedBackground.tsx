import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      {/* ===== FONDS STATIQUES ===== */}
      <div className="absolute inset-0 bg-theme-light bg-cover bg-center bg-no-repeat dark:hidden" />
      <div className="absolute inset-0 hidden bg-theme-dark bg-cover bg-center bg-no-repeat dark:block" />

      {/* ===== SUPERPOSITION SVG POUR L'ANIMATION ===== */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1170 2532"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          {/* === Dégradé pour la lueur animée === */}
          <linearGradient id="glow-gradient" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="rgba(0, 255, 255, 0)" />
            <stop offset="50%" stopColor="rgba(0, 255, 255, 0.5)" />
            <stop offset="100%" stopColor="rgba(0, 255, 255, 0)" />
          </linearGradient>

          {/* === Masques individuels pour chaque piste === */}
          <mask id="mask-left">
            <path d="M 120 2532 Q 250 2000, 480 1550" stroke="white" strokeWidth="60" fill="none" strokeLinecap="round" />
          </mask>
          <mask id="mask-center">
            <path d="M 585 2532 L 585 1550" stroke="white" strokeWidth="60" fill="none" strokeLinecap="round" />
          </mask>
          <mask id="mask-right">
            <path d="M 1050 2532 Q 920 2000, 690 1550" stroke="white" strokeWidth="60" fill="none" strokeLinecap="round" />
          </mask>
        </defs>

        {/* 
          Rectangles animés.
          Chaque rectangle remplit tout le SVG et est masqué par une piste.
          On applique le dégradé "glow-gradient" comme remplissage.
          L'animation `flow-glow` est appliquée avec des durées et des délais différents
          pour créer un effet asynchrone et organique.
        */}
        <g fill="url(#glow-gradient)">
          <rect
            width="1170"
            height="2532"
            mask="url(#mask-left)"
            style={{
              animation: 'flow-glow 8s linear infinite',
            }}
          />
          <rect
            width="1170"
            height="2532"
            mask="url(#mask-center)"
            style={{
              animation: 'flow-glow 7s linear infinite',
              animationDelay: '0.5s',
            }}
          />
          <rect
            width="1170"
            height="2532"
            mask="url(#mask-right)"
            style={{
              animation: 'flow-glow 8s linear infinite',
              animationDelay: '0.8s',
            }}
          />
        </g>
      </svg>
    </div>
  );
};

export default AnimatedBackground;