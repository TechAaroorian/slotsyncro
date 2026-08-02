// components/logo.tsx
export function Logo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Rounded Calendar Frame */}
      <rect
        x="2"
        y="4"
        width="28"
        height="24"
        rx="6"
        className="stroke-gray-900 dark:stroke-white"
        strokeWidth="2.5"
      />

      {/* Top Header Bar Line */}
      <path
        d="M2 11H30"
        className="stroke-gray-900 dark:stroke-white"
        strokeWidth="2"
      />

      {/* Grid Slots (Representing Available Time Slots) */}
      <rect
        x="6"
        y="15"
        width="5"
        height="4"
        rx="1.5"
        className="fill-gray-300 dark:fill-gray-700"
      />
      <rect
        x="13.5"
        y="15"
        width="5"
        height="4"
        rx="1.5"
        className="fill-blue-600 dark:fill-blue-500"
      />
      <rect
        x="21"
        y="15"
        width="5"
        height="4"
        rx="1.5"
        className="fill-gray-300 dark:fill-gray-700"
      />

      <rect
        x="6"
        y="21"
        width="5"
        height="4"
        rx="1.5"
        className="fill-blue-600 dark:fill-blue-500"
      />
      <rect
        x="13.5"
        y="21"
        width="5"
        height="4"
        rx="1.5"
        className="fill-gray-300 dark:fill-gray-700"
      />
      <rect
        x="21"
        y="21"
        width="5"
        height="4"
        rx="1.5"
        className="fill-emerald-500"
      />
    </svg>
  );
}
