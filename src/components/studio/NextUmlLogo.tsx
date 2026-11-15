import React from "react";

interface NextUmlLogoProps {
  className?: string;
}

export function NextUmlLogo({ className = "h-9 w-9" }: NextUmlLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id="nextuml-bg"
          x1="8"
          y1="6"
          x2="56"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#131c31" />
          <stop offset="100%" stopColor="#070b14" />
        </linearGradient>
        <linearGradient
          id="nextuml-accent"
          x1="14"
          y1="14"
          x2="50"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="url(#nextuml-bg)"
        stroke="#38bdf8"
        strokeOpacity="0.38"
        strokeWidth="2"
      />
      <path
        d="M22 21H32V43H42"
        stroke="url(#nextuml-accent)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 21H42"
        stroke="#38bdf8"
        strokeOpacity="0.55"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />
      <rect
        x="12"
        y="13"
        width="14"
        height="14"
        rx="4"
        fill="#0d1322"
        stroke="#38bdf8"
        strokeWidth="2.6"
      />
      <rect
        x="38"
        y="13"
        width="14"
        height="14"
        rx="4"
        fill="#0d1322"
        stroke="#818cf8"
        strokeWidth="2.6"
      />
      <rect x="38" y="37" width="14" height="14" rx="4" fill="url(#nextuml-accent)" />
      <circle cx="19" cy="20" r="2.2" fill="#38bdf8" />
      <circle cx="45" cy="44" r="2.2" fill="#070b14" />
    </svg>
  );
}

