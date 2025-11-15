import React from 'react';

interface SemanticSliderProps {
  label: string;
  minLabel: string;
  maxLabel: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  inverted?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const SemanticSlider: React.FC<SemanticSliderProps> = ({
  label,
  minLabel,
  maxLabel,
  value,
  onChange,
  min = 0,
  max = 100,
  inverted = false,
  orientation = 'horizontal',
}) => {
  const getSliderColor = () => {
    const percentage = (value - min) / (max - min);
    const hue = inverted ? (1 - percentage) * 120 : percentage * 120;
    return `hsl(${hue}, 80%, 50%)`;
  };

  const sliderStyle = {
    '--slider-color': getSliderColor(),
  } as React.CSSProperties;

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col items-center justify-start h-full">
        <label className="block text-sm font-medium text-light-label dark:text-dark-label mb-2 text-center h-10">{label}</label>
        <div className="text-center my-2 text-sm font-semibold" style={{ color: getSliderColor() }}>
          {value}
        </div>
        <div className="flex flex-col items-center justify-center flex-grow" onPointerDown={(e) => e.stopPropagation()}>
          <span className="text-xs text-gray-500">{maxLabel}</span>
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="bg-gray-200 dark:bg-gray-600 rounded-lg slider-thumb slider-vertical"
            style={sliderStyle}
          />
          <span className="text-xs text-gray-500">{minLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-light-label dark:text-dark-label mb-2">{label}</label>
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
        style={sliderStyle}
      />
      <div className="text-center mt-2 text-sm font-semibold" style={{ color: getSliderColor() }}>
        {value}
      </div>
    </div>
  );
};
