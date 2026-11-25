/**
 * RupeeWise brand logo icon featuring the Indian Rupee (₹) symbol on an orange rounded badge.
 */
function RupeeLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#f97316" />
      <path
        d="M9 8.5H23"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M9 13H19.5"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M13.5 8.5V13C17.5 13 18.5 14.5 18.5 16.8C18.5 19.2 16.5 20.8 13.5 20.8"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 17.5L21 25.5"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default RupeeLogo;
