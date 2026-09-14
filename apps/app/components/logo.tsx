export function Logo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="18" fill="#1E6646" />
      <rect x="13" y="17" width="31" height="12" rx="6" fill="white" />
      <rect x="20" y="35" width="31" height="12" rx="6" fill="white" />
      <circle cx="46" cy="19" r="7" fill="#E97855" stroke="#1E6646" strokeWidth="4" />
    </svg>
  );
}
