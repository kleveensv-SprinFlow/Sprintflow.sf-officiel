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
      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SprintyIcon;