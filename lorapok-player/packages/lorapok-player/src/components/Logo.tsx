// Brand Logo Component (Embedded to prevent path issues)
const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00F3FF">
          <animate attributeName="stop-color" values="#00F3FF;#BC13FE;#00F3FF" dur="8s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#BC13FE">
          <animate attributeName="stop-color" values="#BC13FE;#00F3FF;#BC13FE" dur="8s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="12" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Tech Ring Background */}
    <g>
      <circle cx="256" cy="256" r="230" stroke="url(#brandGradient)" strokeWidth="2" strokeDasharray="15 10" opacity="0.1">
        <animateTransform attributeName="transform" type="rotate" from="0 256 256" to="360 256 256" dur="60s" repeatCount="indefinite" />
      </circle>
      <circle cx="256" cy="256" r="245" stroke="url(#brandGradient)" strokeWidth="6" opacity="0.3">
        <animateTransform attributeName="transform" type="rotate" from="360 256 256" to="0 256 256" dur="45s" repeatCount="indefinite" />
      </circle>
    </g>

    {/* Segmented Larva - Bio-Digital Identity */}
    <g transform="translate(45, 45) scale(0.82)">
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 256 256" to="360 256 256" dur="120s" repeatCount="indefinite" />
        {[...Array(9)].map((_, i) => {
          const offsetAngle = 0.8;
          const angle = (i * 0.45) + offsetAngle;
          const dist = 175;
          const x = 256 + Math.cos(angle) * dist;
          const y = 256 + Math.sin(angle) * dist;
          const radius = 65 - (i * 5);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={radius}
              fill="url(#brandGradient)"
              fillOpacity={1.0 - (i * 0.08)}
              filter={i === 0 ? "url(#glow)" : ""}
            >
              <animate attributeName="r" values={`${radius};${radius + 3};${radius}`} dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
            </circle>
          );
        })}

        {/* Eye Feature */}
        <circle cx={256 + Math.cos(0.8) * 175 + 10} cy={256 + Math.sin(0.8) * 175 - 10} r="14" fill="#00F3FF">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Code Snippet Branding */}
        <path
          d="M260 240 L245 255 L260 270 M300 240 L315 255 L300 270"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeOpacity="0.7"
          transform={`translate(${Math.cos(0.8) * 140}, ${Math.sin(0.8) * 140}) rotate(30)`}
        />
      </g>
    </g>
  </svg>
);
