import React from 'react';

interface SprintyIconProps extends React.SVGProps<SVGSVGElement> {}

const SprintyIcon: React.FC<SprintyIconProps> = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.2 0.5L1.7 14.3H12l-1.1 9.2L22.4 9.7H12L13.2 0.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SprintyIcon;