import React from 'react';

interface PemilosLogoProps {
  className?: string;
  withContainer?: boolean;
  containerClassName?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
}

/**
 * Official PEMILOS (Komisi Pemilihan OSIS) Logo Component
 * High precision, resolution-independent vector SVG logo.
 * Rendered inline so it NEVER breaks regardless of base path (GitHub Pages, localhost, etc.)
 */
export const PemilosLogo: React.FC<PemilosLogoProps> = ({
  className = 'w-10 h-10',
  withContainer = false,
  containerClassName = 'p-1 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center',
  width,
  height,
  style,
}) => {
  const svgLogo = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width={width}
      height={height}
      style={style}
      className={`shrink-0 select-none ${className}`}
      aria-label="Logo Komisi Pemilihan OSIS (PEMILOS)"
      role="img"
    >
      <defs>
        {/* Drop shadow */}
        <filter id="pemilosBadgeShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.25" />
        </filter>

        {/* Outer Shield Path for Clipping & Border */}
        <clipPath id="pemilosInnerShieldClip">
          <path d="M 250,55 C 340,55 385,85 400,165 C 410,225 410,275 400,335 C 385,415 340,445 250,445 C 160,445 115,415 100,335 C 90,275 90,225 100,165 C 115,85 160,55 250,55 Z" />
        </clipPath>

        {/* Center Field Clip (Inside Black Border) */}
        <clipPath id="pemilosCenterFieldClip">
          <path d="M 250,88 C 315,88 348,110 358,170 C 366,215 366,285 358,330 C 348,390 315,412 250,412 C 185,412 152,390 142,330 C 134,285 134,215 142,170 C 152,110 185,88 250,88 Z" />
        </clipPath>

        {/* Text Paths for Top, Left, Right, Bottom Arcs */}
        <path id="pemilosPathTop" d="M 170,82 Q 250,68 330,82" fill="none" />
        <path id="pemilosPathLeft" d="M 112,175 Q 98,250 114,325" fill="none" />
        <path id="pemilosPathRight" d="M 388,175 Q 402,250 386,325" fill="none" />
        <path id="pemilosPathBottom" d="M 180,418 Q 250,432 320,418" fill="none" />
      </defs>

      {/* OUTER BLACK SHIELD */}
      <path
        d="M 250,50 C 345,50 392,82 408,165 C 418,225 418,275 408,335 C 392,418 345,450 250,450 C 155,450 108,418 92,335 C 82,275 82,225 92,165 C 108,82 155,50 250,50 Z"
        fill="#121316"
        stroke="#000000"
        strokeWidth="4"
        filter="url(#pemilosBadgeShadow)"
      />

      {/* WHITE TEXT AROUND BLACK BORDER */}
      <text
        fill="#FFFFFF"
        fontFamily="'Arial Black', 'Impact', sans-serif"
        fontWeight="900"
        fontSize="28"
        letterSpacing="4"
        textAnchor="middle"
      >
        <textPath href="#pemilosPathTop" startOffset="50%">
          KOMISI
        </textPath>
      </text>

      <text
        fill="#FFFFFF"
        fontFamily="'Arial Black', 'Impact', sans-serif"
        fontWeight="900"
        fontSize="25"
        letterSpacing="3"
        textAnchor="middle"
      >
        <textPath href="#pemilosPathLeft" startOffset="50%">
          • P E M I
        </textPath>
      </text>

      <text
        fill="#FFFFFF"
        fontFamily="'Arial Black', 'Impact', sans-serif"
        fontWeight="900"
        fontSize="25"
        letterSpacing="3"
        textAnchor="middle"
      >
        <textPath href="#pemilosPathRight" startOffset="50%">
          • O S I S
        </textPath>
      </text>

      <text
        fill="#FFFFFF"
        fontFamily="'Arial Black', 'Impact', sans-serif"
        fontWeight="900"
        fontSize="26"
        letterSpacing="4"
        textAnchor="middle"
      >
        <textPath href="#pemilosPathBottom" startOffset="50%">
          L I H A N
        </textPath>
      </text>

      {/* INNER SHIELD FIELD (RED & WHITE BACKGROUND) */}
      <g clipPath="url(#pemilosCenterFieldClip)">
        <rect x="80" y="50" width="340" height="200" fill="#DC2626" />
        <rect x="80" y="250" width="340" height="200" fill="#FFFFFF" />
        <line x1="120" y1="250" x2="380" y2="250" stroke="#B91C1C" strokeWidth="1.5" />
      </g>

      {/* INNER SHIELD BORDER LINE */}
      <path
        d="M 250,88 C 315,88 348,110 358,170 C 366,215 366,285 358,330 C 348,390 315,412 250,412 C 185,412 152,390 142,330 C 134,285 134,215 142,170 C 152,110 185,88 250,88 Z"
        fill="none"
        stroke="#121316"
        strokeWidth="3"
      />

      {/* CENTER OSIS EMBLEM (LAMBANG RESMI OSIS) */}
      <g transform="translate(0, 0)">
        {/* Golden Sun Arch */}
        <path d="M 190,260 A 62,62 0 0,1 310,260 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
        <path d="M 197,255 A 54,54 0 0,1 303,255 Z" fill="#FBBF24" />
        <path d="M 205,248 A 46,46 0 0,1 295,248 Z" fill="#FEF08A" />

        {/* Rainbow Arches (Merah - Putih - Kuning) */}
        <path d="M 192,235 C 192,178 308,178 308,235" fill="none" stroke="#DC2626" strokeWidth="5" />
        <path d="M 197,235 C 197,184 303,184 303,235" fill="none" stroke="#FFFFFF" strokeWidth="4" />
        <path d="M 201,235 C 201,189 299,189 299,235" fill="none" stroke="#F59E0B" strokeWidth="4" />

        {/* Golden Star / 5-Petal Facet Flower at the Top */}
        <g transform="translate(250, 205)">
          <polygon
            points="0,-32 9,-11 31,-11 14,3 20,24 0,12 -20,24 -14,3 -31,-11 -9,-11"
            fill="#FFFFFF"
            stroke="#1E293B"
            strokeWidth="2"
          />
          <polygon
            points="0,-27 7,-9 26,-9 12,2 17,20 0,10 -17,20 -12,2 -26,-9 -7,-9"
            fill="#F8FAFC"
          />
          <line x1="0" y1="-27" x2="0" y2="10" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="26" y1="-9" x2="-12" y2="2" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="-26" y1="-9" x2="12" y2="2" stroke="#94A3B8" strokeWidth="1.5" />
        </g>

        {/* Two Hands Cradling (Kiri & Kanan) */}
        <path
          d="M 205,225 C 205,245 220,270 245,274 L 245,264 C 230,260 216,242 216,225 Z"
          fill="#991B1B"
          stroke="#450A0A"
          strokeWidth="1.5"
        />
        <path
          d="M 295,225 C 295,245 280,270 255,274 L 255,264 C 270,260 284,242 284,225 Z"
          fill="#991B1B"
          stroke="#450A0A"
          strokeWidth="1.5"
        />

        {/* PADI (Rice Stalk - Left) */}
        <g fill="#F59E0B" stroke="#78350F" strokeWidth="1">
          <ellipse cx="180" cy="225" rx="4" ry="7" transform="rotate(-25 180 225)" />
          <ellipse cx="176" cy="239" rx="4" ry="7" transform="rotate(-30 176 239)" />
          <ellipse cx="174" cy="254" rx="4" ry="7" transform="rotate(-35 174 254)" />
          <ellipse cx="176" cy="269" rx="4" ry="7" transform="rotate(-30 176 269)" />
          <ellipse cx="180" cy="284" rx="4" ry="7" transform="rotate(-20 180 284)" />
          <ellipse cx="188" cy="298" rx="4" ry="7" transform="rotate(-10 188 298)" />
          <path d="M 183,215 Q 170,260 195,310" fill="none" stroke="#78350F" strokeWidth="2.5" />
        </g>

        {/* KAPAS (Cotton Stalk - Right) */}
        <g>
          <path d="M 317,215 Q 330,260 305,310" fill="none" stroke="#15803D" strokeWidth="2.5" />
          <circle cx="320" cy="230" r="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
          <polygon points="320,230 326,236 322,238 316,235" fill="#15803D" />

          <circle cx="324" cy="248" r="6.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
          <polygon points="324,248 330,254 326,256 320,253" fill="#15803D" />

          <circle cx="324" cy="268" r="7" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
          <polygon points="324,268 329,274 324,276 318,272" fill="#15803D" />

          <circle cx="318" cy="286" r="6.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
          <polygon points="318,286 322,292 317,294 312,289" fill="#15803D" />
        </g>

        {/* Open Book of Knowledge at the Bottom */}
        <g transform="translate(250, 305)">
          <path d="M 0,0 C -15,-6 -30,-6 -45,0 L -45,18 C -30,12 -15,12 0,18 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
          <path d="M 0,0 C 15,-6 30,-6 45,0 L 45,18 C 30,12 15,12 0,18 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2" />
          <line x1="0" y1="0" x2="0" y2="18" stroke="#0F172A" strokeWidth="2.5" />
          <path d="M -38,5 C -28,2 -16,2 -6,5" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
          <path d="M -38,10 C -28,7 -16,7 -6,10" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
          <path d="M 38,5 C 28,2 16,2 6,5" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
          <path d="M 38,10 C 28,7 16,7 6,10" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
        </g>

        {/* Ribbon Banner with "OSIS" */}
        <g transform="translate(250, 345)">
          <path
            d="M -90,-16 L 90,-16 C 98,-16 102,-10 100,-4 L 92,16 C 90,22 84,24 78,24 L -78,24 C -84,24 -90,22 -92,16 L -100,-4 C -102,-10 -98,-16 -90,-16 Z"
            fill="#881337"
            stroke="#0F172A"
            strokeWidth="2.5"
          />
          <circle cx="-75" cy="4" r="2.5" fill="#F59E0B" stroke="#450A0A" strokeWidth="1" />
          <circle cx="75" cy="4" r="2.5" fill="#F59E0B" stroke="#450A0A" strokeWidth="1" />
          <text
            x="0"
            y="10"
            fill="#FFFFFF"
            fontFamily="'Arial Black', 'Impact', sans-serif"
            fontWeight="900"
            fontSize="23"
            letterSpacing="6"
            textAnchor="middle"
            stroke="#000000"
            strokeWidth="1"
          >
            OSIS
          </text>
        </g>
      </g>
    </svg>
  );

  if (withContainer) {
    return <div className={containerClassName}>{svgLogo}</div>;
  }

  return svgLogo;
};
