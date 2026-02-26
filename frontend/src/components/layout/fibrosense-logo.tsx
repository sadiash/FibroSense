export function FibroSenseLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Upper left wing */}
      <path
        d="M11.5 8.5L4 4L2.5 11.5L11.5 13.5Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Upper right wing */}
      <path
        d="M12.5 8.5L20 4L21.5 11.5L12.5 13.5Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Lower left wing */}
      <path
        d="M11.5 14.5L5.5 18L8 21.5L11.5 17Z"
        fill="currentColor"
        opacity="0.65"
      />
      {/* Lower right wing */}
      <path
        d="M12.5 14.5L18.5 18L16 21.5L12.5 17Z"
        fill="currentColor"
        opacity="0.65"
      />
      {/* Body */}
      <path
        d="M12 6.5V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Antennae */}
      <path
        d="M12 7L9 3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M12 7L15 3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Antenna tips */}
      <circle cx="9" cy="3" r="1" fill="currentColor" />
      <circle cx="15" cy="3" r="1" fill="currentColor" />
    </svg>
  );
}
