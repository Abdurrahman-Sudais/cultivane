/** Technical line illustration of a stirred-tank fermenter with probes. */
export function BioreactorIllustration({ className, dark = false }: { className?: string; dark?: boolean }) {
  const stroke = dark ? '#b9e4c9' : '#1a4636';
  const soft = dark ? 'rgba(185,228,201,0.35)' : 'rgba(26,70,54,0.3)';
  const fill = dark ? 'rgba(62,135,128,0.25)' : 'rgba(62,135,128,0.16)';
  return (
    <svg viewBox="0 0 220 300" className={className} role="img" aria-label="Line drawing of a stirred-tank fermenter with temperature, pH and dissolved-oxygen probes">
      <g fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="104" y="8" width="12" height="22" rx="2" />
        <path d="M110 30v190" />
        <path d="M50 60c0-18 26-26 60-26s60 8 60 26v170c0 22-26 34-60 34s-60-12-60-34z" />
        <path d="M50 110c20 8 40-8 60 0s40 8 60 0v120c0 22-26 34-60 34s-60-12-60-34z" fill={fill} stroke="none" />
        <path d="M50 110c20 8 40-8 60 0s40 8 60 0" stroke={soft} />
        <path d="M86 160h48M86 160l-8 6M134 160l8 6M86 210h48M86 210l-8 6M134 210l8 6" />
        <path d="M38 80v170M182 80v170" stroke={soft} strokeDasharray="3 4" />
        <path d="M70 46v-20h-14M150 46v-24h18M135 40v-14" />
        <circle cx="168" cy="22" r="5" />
        <path d="M60 140h-30v-30M60 185h-36M60 230h-28v18" />
        <circle cx="30" cy="106" r="4" />
        <circle cx="22" cy="185" r="4" />
        <circle cx="32" cy="252" r="4" />
        <path d="M80 268v20M140 268v20M70 288h80" />
      </g>
      <g fontFamily="IBM Plex Mono, monospace" fontSize="8" fill={stroke}>
        <text x="4" y="98">TT</text>
        <text x="2" y="177">pH</text>
        <text x="4" y="266">DO</text>
        <text x="174" y="16">FEED</text>
      </g>
      <g fill={stroke}>
        {[[90, 130], [128, 142], [104, 188], [140, 196], [82, 236], [120, 246]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2" opacity="0.6" />
        ))}
      </g>
    </svg>
  );
}
