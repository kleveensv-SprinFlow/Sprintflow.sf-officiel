import React, { useEffect, useRef } from 'react';
// @ts-ignore
import SprintyAvatarSVG from '../../../public/assets/sprinty-avatar-animated.svg?react';

const SprintyAvatar: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;

    const blink = () => {
      if (svgRef.current) {
        const eyesOpen = svgRef.current.querySelector<SVGGraphicsElement>('#avatar-yeux-ouverts');
        const eyesClosed = svgRef.current.querySelector<SVGGraphicsElement>('#avatar-yeux-fermes');

        if (eyesOpen && eyesClosed) {
          eyesOpen.style.display = 'none';
          eyesClosed.style.display = 'block';

          setTimeout(() => {
            if (eyesOpen && eyesClosed) {
                eyesOpen.style.display = 'block';
                eyesClosed.style.display = 'none';
            }
          }, 150);
        }
      }
    };

    const scheduleBlink = () => {
      const randomInterval = Math.random() * (8000 - 3000) + 3000;
      blinkTimeout = setTimeout(() => {
        blink();
        scheduleBlink();
      }, randomInterval);
    };

    scheduleBlink();

    return () => {
      clearTimeout(blinkTimeout);
    };
  }, []);

  return <SprintyAvatarSVG ref={svgRef} />;
};

export default SprintyAvatar;