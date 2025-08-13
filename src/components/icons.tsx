import type { SVGProps } from "react";

export function HealthomaniaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 17v-5" />
      <path d="M15 17v-5" />
      <path d="M9 14h6" />
      <circle cx="12" cy="10" r="2" />
      <circle cx="12" cy="10" r="0.75" fill="currentColor" />
    </svg>
  );
}
