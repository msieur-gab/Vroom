/**
 * SelfieOverlays - SVG overlay elements for milestone selfies
 * Each overlay is designed for kids to align their face with
 */

export const SELFIE_OVERLAYS = {
  'baby-hat': `
    <svg class="selfie-overlay" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Baby bonnet/hat on top of head -->
      <g transform="translate(150, 60)">
        <!-- Hat body -->
        <ellipse cx="0" cy="-20" rx="70" ry="35" fill="#FFC0CB" stroke="#FF69B4" stroke-width="3"/>
        <ellipse cx="0" cy="-35" rx="65" ry="30" fill="#FFB6C1"/>
        <!-- Pom-pom -->
        <circle cx="0" cy="-50" r="15" fill="#FF69B4"/>
        <!-- Ribbons -->
        <path d="M -60,-15 Q -70,0 -65,15" stroke="#FF69B4" stroke-width="4" fill="none"/>
        <path d="M 60,-15 Q 70,0 65,15" stroke="#FF69B4" stroke-width="4" fill="none"/>
      </g>
    </svg>
  `,

  'explorer-goggles': `
    <svg class="selfie-overlay" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Aviator/explorer goggles over eyes -->
      <g transform="translate(150, 130)">
        <!-- Left lens -->
        <circle cx="-35" cy="0" r="30" fill="rgba(139,69,19,0.3)" stroke="#8B4513" stroke-width="4"/>
        <circle cx="-35" cy="0" r="25" fill="rgba(135,206,235,0.4)"/>

        <!-- Right lens -->
        <circle cx="35" cy="0" r="30" fill="rgba(139,69,19,0.3)" stroke="#8B4513" stroke-width="4"/>
        <circle cx="35" cy="0" r="25" fill="rgba(135,206,235,0.4)"/>

        <!-- Bridge -->
        <rect x="-5" y="-3" width="10" height="6" fill="#8B4513" rx="2"/>

        <!-- Straps -->
        <path d="M -65,0 Q -80,0 -90,-5" stroke="#8B4513" stroke-width="3" fill="none"/>
        <path d="M 65,0 Q 80,0 90,-5" stroke="#8B4513" stroke-width="3" fill="none"/>
      </g>
    </svg>
  `,

  'party-hat': `
    <svg class="selfie-overlay" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Colorful party hat on top of head (moved higher to not block face) -->
      <g transform="translate(150, 20)">
        <!-- Hat cone -->
        <path d="M -50,20 L 0,-60 L 50,20 Z" fill="#FF6B6B" stroke="#CC5555" stroke-width="3"/>
        <!-- Stripes -->
        <path d="M -35,0 L 0,-60 L 35,0" fill="none" stroke="#FFD93D" stroke-width="6"/>
        <path d="M -25,10 L 0,-60 L 25,10" fill="none" stroke="#6BCB77" stroke-width="6"/>
        <!-- Pom-pom -->
        <circle cx="0" cy="-60" r="10" fill="#FFD93D"/>
        <!-- Base -->
        <ellipse cx="0" cy="20" rx="52" ry="10" fill="#4D96FF" stroke="#3A7BD5" stroke-width="2"/>
      </g>
    </svg>
  `,

  'warrior-helmet': `
    <svg class="selfie-overlay" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Medieval/warrior helmet -->
      <g transform="translate(150, 90)">
        <!-- Helmet dome -->
        <path d="M -60,-10 Q -65,-50 0,-60 Q 65,-50 60,-10 Z" fill="#C0C0C0" stroke="#808080" stroke-width="3"/>
        <!-- Crest/plume -->
        <path d="M -10,-60 Q 0,-80 10,-60" fill="#DC143C" stroke="#8B0000" stroke-width="2"/>
        <ellipse cx="0" cy="-70" rx="12" ry="20" fill="#DC143C" stroke="#8B0000" stroke-width="2"/>
        <!-- Face guard -->
        <rect x="-55" y="-10" width="110" height="15" fill="#A9A9A9" stroke="#808080" stroke-width="2" rx="3"/>
        <!-- Visor slits -->
        <rect x="-40" y="-5" width="25" height="5" fill="#333" rx="1"/>
        <rect x="15" y="-5" width="25" height="5" fill="#333" rx="1"/>
      </g>
    </svg>
  `,

  'star-crown': `
    <svg class="selfie-overlay" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Crown with stars -->
      <g transform="translate(150, 60)">
        <!-- Crown base -->
        <path d="M -70,0 L -60,-30 L -30,-10 L 0,-40 L 30,-10 L 60,-30 L 70,0 Z"
              fill="#FFD700" stroke="#FFA500" stroke-width="3"/>
        <!-- Jewels -->
        <circle cx="-45" cy="-15" r="6" fill="#FF1493"/>
        <circle cx="0" cy="-20" r="6" fill="#00CED1"/>
        <circle cx="45" cy="-15" r="6" fill="#FF1493"/>
        <!-- Crown band -->
        <ellipse cx="0" cy="0" rx="72" ry="12" fill="#DAA520" stroke="#B8860B" stroke-width="2"/>
      </g>
    </svg>
  `,

  'astronaut-helmet': `
    <svg class="selfie-overlay" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Space helmet -->
      <g transform="translate(150, 150)">
        <!-- Helmet glass -->
        <ellipse cx="0" cy="-20" rx="75" ry="85" fill="rgba(135,206,250,0.3)"
                 stroke="#E0E0E0" stroke-width="6"/>
        <!-- Reflections -->
        <ellipse cx="-20" cy="-40" rx="25" ry="35" fill="rgba(255,255,255,0.4)"/>
        <ellipse cx="30" cy="-50" rx="15" ry="20" fill="rgba(255,255,255,0.3)"/>
        <!-- Helmet ring -->
        <ellipse cx="0" cy="60" rx="80" ry="20" fill="#C0C0C0" stroke="#A0A0A0" stroke-width="3"/>
        <!-- Tech details -->
        <rect x="-70" y="50" width="20" height="8" fill="#FF4444" rx="2"/>
        <rect x="50" y="50" width="20" height="8" fill="#44FF44" rx="2"/>
      </g>
    </svg>
  `,

  'moon-glasses': `
    <svg class="selfie-overlay" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Funky moon-shaped glasses -->
      <g transform="translate(150, 130)">
        <!-- Left lens (crescent moon) -->
        <g transform="translate(-35, 0)">
          <circle cx="0" cy="0" r="28" fill="#F0E68C" stroke="#DAA520" stroke-width="3"/>
          <circle cx="8" cy="-4" r="24" fill="rgba(255,255,255,0.4)"/>
        </g>
        <!-- Right lens (full moon) -->
        <g transform="translate(35, 0)">
          <circle cx="0" cy="0" r="28" fill="#F0E68C" stroke="#DAA520" stroke-width="3"/>
          <circle cx="-3" cy="-3" r="6" fill="#D3D3D3"/>
          <circle cx="8" cy="5" r="4" fill="#D3D3D3"/>
        </g>
        <!-- Bridge -->
        <rect x="-8" y="-3" width="16" height="6" fill="#DAA520" rx="3"/>
        <!-- Star decorations -->
        <text x="-50" y="-25" font-size="16" fill="#FFD700">★</text>
        <text x="42" y="-25" font-size="16" fill="#FFD700">★</text>
      </g>
    </svg>
  `,

  'globe-crown': `
    <svg class="selfie-overlay" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Earth globe crown -->
      <g transform="translate(150, 70)">
        <!-- Crown points with continents -->
        <path d="M -70,0 L -60,-35 L -30,-15 L 0,-45 L 30,-15 L 60,-35 L 70,0 Z"
              fill="#4169E1" stroke="#1E90FF" stroke-width="3"/>
        <!-- Continents on crown points -->
        <ellipse cx="-60" cy="-28" rx="8" ry="12" fill="#228B22"/>
        <ellipse cx="0" cy="-38" rx="10" ry="14" fill="#228B22"/>
        <ellipse cx="60" cy="-28" rx="8" ry="12" fill="#228B22"/>
        <!-- Crown band -->
        <ellipse cx="0" cy="0" rx="72" ry="12" fill="#4682B4" stroke="#1E90FF" stroke-width="2"/>
        <!-- Latitude/longitude lines -->
        <path d="M -60,-25 Q 0,-30 60,-25" stroke="#87CEEB" stroke-width="1" fill="none"/>
        <path d="M -50,-30 Q 0,-25 50,-30" stroke="#87CEEB" stroke-width="1" fill="none"/>
      </g>
    </svg>
  `
};

/**
 * Get SVG overlay for a milestone
 * @param {string} overlayType - The overlay identifier from milestone data
 * @returns {string} SVG markup
 */
export function getOverlaySVG(overlayType) {
  return SELFIE_OVERLAYS[overlayType] || '';
}
