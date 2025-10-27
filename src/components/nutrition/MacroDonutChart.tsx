import React from 'react';

interface MacroDonutChartProps {
  data: {
    proteins: number;
    carbs: number;
    fats: number;
  };
}

export function MacroDonutChart({ data }: MacroDonutChartProps) {
  const total = data.proteins + data.carbs + data.fats;

  if (total === 0) {
    return (
      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-xs text-gray-400">N/A</span>
      </div>
    );
  }

  const proteinPercent = (data.proteins / total) * 100;
  const carbsPercent = (data.carbs / total) * 100;
  const fatsPercent = (data.fats / total) * 100;

  const proteinAngle = (proteinPercent / 100) * 360;
  const carbsAngle = (carbsPercent / 100) * 360;
  const fatsAngle = (fatsPercent / 100) * 360;

  let currentAngle = 0;
  const segments = [];

  if (data.proteins > 0) {
    segments.push({
      color: '#ef4444',
      startAngle: currentAngle,
      endAngle: currentAngle + proteinAngle,
      label: 'P'
    });
    currentAngle += proteinAngle;
  }

  if (data.carbs > 0) {
    segments.push({
      color: '#3b82f6',
      startAngle: currentAngle,
      endAngle: currentAngle + carbsAngle,
      label: 'G'
    });
    currentAngle += carbsAngle;
  }

  if (data.fats > 0) {
    segments.push({
      color: '#eab308',
      startAngle: currentAngle,
      endAngle: currentAngle + fatsAngle,
      label: 'L'
    });
  }

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  };

  return (
    <div className="relative w-16 h-16">
      <svg width="64" height="64" viewBox="0 0 64 64">
        {segments.map((segment, index) => (
          <path
            key={index}
            d={describeArc(32, 32, 28, segment.startAngle, segment.endAngle)}
            fill={segment.color}
            opacity="0.9"
          />
        ))}
        <circle cx="32" cy="32" r="18" fill="white" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs font-bold text-gray-700">{total.toFixed(0)}g</div>
        </div>
      </div>
    </div>
  );
}
