// Renders the growing plant as SVG. The shape changes meaningfully between
// stages (not just a number), and the palette changes per seed species.

const SPECIES_COLORS = {
  fern: { leaf: "#4ade80", leafDark: "#15803d", accent: "#bbf7d0" },
  bloom: { leaf: "#f472b6", leafDark: "#be185d", accent: "#fbcfe8" },
  succulent: { leaf: "#67e8f9", leafDark: "#0e7490", accent: "#a5f3fc" },
  bonsai: { leaf: "#a3e635", leafDark: "#4d7c0f", accent: "#d9f99d" },
  sunflower: { leaf: "#fde047", leafDark: "#ca8a04", accent: "#fef9c3" },
};

export default function PlantVisual({ stage = "seed", species = "fern", size = 220 }) {
  const c = SPECIES_COLORS[species] || SPECIES_COLORS.fern;

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size}
      className="drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
    >
      {/* pot */}
      <ellipse cx="100" cy="200" rx="46" ry="10" fill="#00000033" />
      <path d="M60 170 L140 170 L130 205 Q100 214 70 205 Z" fill="#8b5e3c" />
      <path d="M60 170 L140 170 L136 180 L64 180 Z" fill="#a97449" />

      {stage === "seed" && (
        <g className="animate-pop">
          <ellipse cx="100" cy="163" rx="10" ry="7" fill="#7c4a24" />
          <ellipse cx="97" cy="160" rx="3" ry="2" fill="#d9b38c" opacity="0.7" />
        </g>
      )}

      {stage === "sprout" && (
        <g className="animate-pop origin-bottom animate-sway">
          <path d="M100 170 C100 150 100 145 100 140" stroke={c.leafDark} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M100 148 C90 142 82 145 80 152 C90 156 97 153 100 148 Z" fill={c.leaf} />
          <path d="M100 148 C110 142 118 145 120 152 C110 156 103 153 100 148 Z" fill={c.leaf} />
        </g>
      )}

      {stage === "small" && (
        <g className="origin-bottom animate-sway">
          <path d="M100 170 C100 140 100 120 100 108" stroke={c.leafDark} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M100 150 C85 142 74 146 70 158 C85 164 96 158 100 150 Z" fill={c.leaf} />
          <path d="M100 150 C115 142 126 146 130 158 C115 164 104 158 100 150 Z" fill={c.leaf} />
          <path d="M100 122 C90 115 82 118 79 128 C90 133 97 128 100 122 Z" fill={c.accent} />
          <path d="M100 122 C110 115 118 118 121 128 C110 133 103 128 100 122 Z" fill={c.accent} />
        </g>
      )}

      {stage === "growing" && (
        <g className="origin-bottom animate-sway">
          <path d="M100 170 C100 130 98 100 100 78" stroke={c.leafDark} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M100 152 C82 143 68 148 63 162 C82 169 95 161 100 152 Z" fill={c.leaf} />
          <path d="M100 152 C118 143 132 148 137 162 C118 169 105 161 100 152 Z" fill={c.leaf} />
          <path d="M100 122 C86 114 75 118 71 130 C86 136 96 130 100 122 Z" fill={c.accent} />
          <path d="M100 122 C114 114 125 118 129 130 C114 136 104 130 100 122 Z" fill={c.accent} />
          <circle cx="100" cy="82" r="9" fill={c.accent} />
          <circle cx="100" cy="82" r="4" fill="#fff" opacity="0.7" />
        </g>
      )}

      {stage === "mature" && (
        <g className="origin-bottom animate-sway">
          <path d="M100 170 C100 120 96 90 100 55" stroke={c.leafDark} strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M100 150 C78 140 60 146 54 163 C78 172 94 161 100 150 Z" fill={c.leaf} />
          <path d="M100 150 C122 140 140 146 146 163 C122 172 106 161 100 150 Z" fill={c.leaf} />
          <path d="M100 115 C82 106 68 111 63 125 C82 132 94 125 100 115 Z" fill={c.accent} />
          <path d="M100 115 C118 106 132 111 137 125 C118 132 106 125 100 115 Z" fill={c.accent} />
          <path d="M100 80 C88 73 79 77 76 87 C88 92 96 87 100 80 Z" fill={c.leaf} />
          <path d="M100 80 C112 73 121 77 124 87 C112 92 104 87 100 80 Z" fill={c.leaf} />
          <circle cx="100" cy="58" r="12" fill={c.accent} />
          <circle cx="88" cy="66" r="7" fill={c.leaf} opacity="0.8" />
          <circle cx="112" cy="66" r="7" fill={c.leaf} opacity="0.8" />
        </g>
      )}

      {stage === "full" && (
        <g className="origin-bottom animate-sway">
          <path d="M100 170 C100 115 92 85 100 40" stroke={c.leafDark} strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M100 148 C74 137 54 144 47 163 C74 174 92 161 100 148 Z" fill={c.leaf} />
          <path d="M100 148 C126 137 146 144 153 163 C126 174 108 161 100 148 Z" fill={c.leaf} />
          <path d="M100 108 C80 98 64 104 58 120 C80 128 94 120 100 108 Z" fill={c.accent} />
          <path d="M100 108 C120 98 136 104 142 120 C120 128 106 120 100 108 Z" fill={c.accent} />
          <path d="M100 70 C86 62 75 66 70 78 C86 84 95 78 100 70 Z" fill={c.leaf} />
          <path d="M100 70 C114 62 125 66 130 78 C114 84 105 78 100 70 Z" fill={c.leaf} />
          {/* full bloom crown */}
          <circle cx="100" cy="40" r="16" fill={c.accent} />
          <circle cx="82" cy="48" r="10" fill={c.leaf} />
          <circle cx="118" cy="48" r="10" fill={c.leaf} />
          <circle cx="100" cy="26" r="10" fill={c.leaf} />
          <circle cx="100" cy="40" r="7" fill="#fff" opacity="0.85" />
          {/* sparkles */}
          <g className="animate-floatUp">
            <circle cx="70" cy="50" r="2" fill="#fff" />
            <circle cx="128" cy="55" r="2" fill="#fff" />
          </g>
        </g>
      )}
    </svg>
  );
}

export const SEED_OPTIONS = [
  { id: "fern", name: "Whispering Fern", blurb: "Steady and calm, grows evenly." },
  { id: "bloom", name: "Dawn Blossom", blurb: "Bursts into color as it matures." },
  { id: "succulent", name: "Moonlit Succulent", blurb: "Resilient, thrives on consistency." },
  { id: "bonsai", name: "Quiet Bonsai", blurb: "Patient growth, deeply rooted." },
  { id: "sunflower", name: "Golden Sunflower", blurb: "Bright, bold, reaches high." },
];
