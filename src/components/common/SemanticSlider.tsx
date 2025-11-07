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
}) => {
  const getSliderColor = () => {
    const percentage = (value - min) / (max - min);
    const hue = inverted ? (1 - percentage) * 120 : percentage * 120;
    return `hsl(${hue}, 80%, 50%)`;
  };

  const sliderStyle = {
    '--slider-color': getSliderColor(),
  } as React.CSSProperties;

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
