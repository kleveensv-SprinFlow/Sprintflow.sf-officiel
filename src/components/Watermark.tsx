
import React from 'react';

interface WatermarkProps {
  imageSrc: string;
  zone1Data: { type: string; value: string };
  zone2Data: { type: string; value: string };
  zone3Data: { type: string; value: string };
}

const Watermark: React.FC<WatermarkProps> = ({ imageSrc, zone1Data, zone2Data, zone3Data }) => {
  const renderZone = (data: { type: string; value: string }, alignment: 'left' | 'center' | 'right') => {
    const textAlignClass = `text-${alignment}`;
    return (
      <div className={`flex flex-col ${textAlignClass} px-4`}>
        <span className="text-xs uppercase font-light text-gray-300 tracking-widest">{data.type}</span>
        <span className="text-2xl font-semibold text-white -mt-1">{data.value}</span>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full font-sanspro">
      <img src={imageSrc} alt="User" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
      
      <div className="absolute top-4 left-4">
        <img src="/logo-sprintflow.png" alt="SprintFlow Logo" className="h-8 opacity-90" />
      </div>

      <div className="absolute bottom-4 w-full">
        <div className="flex justify-between items-end">
          {renderZone(zone1Data, 'left')}
          {renderZone(zone2Data, 'center')}
          {renderZone(zone3Data, 'right')}
        </div>
        <div className="w-full px-4 mt-2">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">#SprintFlow</p>
      </div>
    </div>
  );
};

export default Watermark;
