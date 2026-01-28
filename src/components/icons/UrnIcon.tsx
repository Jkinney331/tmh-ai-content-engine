// LTRFL Custom Urn/Memorial Icon
export const UrnIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Urn body */}
    <path d="M8 21h8a2 2 0 0 0 2-2v-8a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v8a2 2 0 0 0 2 2z" />
    {/* Lid */}
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    {/* Lid knob */}
    <circle cx="12" cy="3" r="1" />
    {/* Decorative band */}
    <path d="M6 13h12" />
  </svg>
)
