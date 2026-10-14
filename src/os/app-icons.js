// Filled, full-colour icons for the system furniture — folders, documents and
// the dock — drawn in the macOS idiom so the desktop reads as a desktop. The
// work itself keeps the peony line glyphs in icons.js.
//
// Gradients need ids, and the same icon is injected many times, so every id
// carries a __ID__ token that art() swaps for a fresh number. Without that a
// closing window can take the one <linearGradient> every other copy points at.

const svg = inner => `<svg viewBox="0 0 64 64" aria-hidden="true">${inner}</svg>`;

export const appIcons = {
  folder: svg(`
    <defs>
      <linearGradient id="fdb__ID__" x1="32" y1="13" x2="32" y2="51" gradientUnits="userSpaceOnUse">
        <stop stop-color="#49A5EC"/><stop offset="1" stop-color="#2B7FCB"/>
      </linearGradient>
      <linearGradient id="fdf__ID__" x1="32" y1="25" x2="32" y2="51" gradientUnits="userSpaceOnUse">
        <stop stop-color="#8FDAFF"/><stop offset="1" stop-color="#44A6EE"/>
      </linearGradient>
    </defs>
    <path d="M10.5 13h14.8c1.3 0 2.5.5 3.4 1.4l3.9 3.9H53.5A5.5 5.5 0 0159 23.9v21.6A5.5 5.5 0 0153.5 51h-43A5.5 5.5 0 015 45.5V18.5A5.5 5.5 0 0110.5 13z" fill="url(#fdb__ID__)"/>
    <path d="M5 25.5h54v20A5.5 5.5 0 0153.5 51h-43A5.5 5.5 0 015 45.5z" fill="url(#fdf__ID__)"/>
    <path d="M5 25.5h54v1.2H5z" fill="#fff" opacity=".55"/>
    <path d="M5 24.3h54v1.2H5z" fill="#0b3a63" opacity=".18"/>`),

  doc: svg(`
    <defs>
      <linearGradient id="dcp__ID__" x1="32" y1="5" x2="32" y2="59" gradientUnits="userSpaceOnUse">
        <stop stop-color="#fff"/><stop offset="1" stop-color="#E4E8ED"/>
      </linearGradient>
    </defs>
    <path d="M13 9a4 4 0 014-4h20l14 14v36a4 4 0 01-4 4H17a4 4 0 01-4-4z" fill="url(#dcp__ID__)"/>
    <path d="M37 5l14 14H41a4 4 0 01-4-4z" fill="#C3CBD4"/>
    <g fill="#AFBAC6">
      <rect x="20" y="28" width="24" height="2.4" rx="1.2"/>
      <rect x="20" y="35" width="24" height="2.4" rx="1.2"/>
      <rect x="20" y="42" width="15" height="2.4" rx="1.2"/>
    </g>`),

  finder: svg(`
    <defs>
      <clipPath id="fnc__ID__"><rect x="2" y="2" width="60" height="60" rx="14"/></clipPath>
      <linearGradient id="fnl__ID__" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
        <stop stop-color="#F2FAFF"/><stop offset="1" stop-color="#CFE6FA"/>
      </linearGradient>
      <linearGradient id="fnd__ID__" x1="2" y1="2" x2="2" y2="62" gradientUnits="userSpaceOnUse">
        <stop stop-color="#49A8EC"/><stop offset="1" stop-color="#1C6FC9"/>
      </linearGradient>
    </defs>
    <g clip-path="url(#fnc__ID__)">
      <rect x="2" y="2" width="60" height="60" fill="url(#fnl__ID__)"/>
      <rect x="2" y="2" width="30" height="60" fill="url(#fnd__ID__)"/>
      <rect x="20" y="22" width="4" height="10" rx="2" fill="#EAF5FF"/>
      <rect x="40" y="22" width="4" height="10" rx="2" fill="#2B4C6B"/>
      <path d="M18 43c4 3.4 8.7 5.1 14 5.1S42 46.4 46 43" fill="none" stroke="#2B4C6B" stroke-width="3" stroke-linecap="round"/>
      <path d="M18 43c3 2.5 6.4 4.1 10 4.8" fill="none" stroke="#DCEDFB" stroke-width="3" stroke-linecap="round"/>
    </g>
    <rect x="2.5" y="2.5" width="59" height="59" rx="13.5" fill="none" stroke="#fff" stroke-opacity=".3"/>`),

  photos: svg(`
    <rect x="2" y="2" width="60" height="60" rx="14" fill="#fff"/>
    <g transform="translate(32 32)" opacity=".93">
      <ellipse cy="-10" rx="6.5" ry="12" fill="#F7A823"/>
      <ellipse cy="-10" rx="6.5" ry="12" fill="#F2DE1E" transform="rotate(45)"/>
      <ellipse cy="-10" rx="6.5" ry="12" fill="#79CC2E" transform="rotate(90)"/>
      <ellipse cy="-10" rx="6.5" ry="12" fill="#1DC3A6" transform="rotate(135)"/>
      <ellipse cy="-10" rx="6.5" ry="12" fill="#2F9BF3" transform="rotate(180)"/>
      <ellipse cy="-10" rx="6.5" ry="12" fill="#8B5CF6" transform="rotate(225)"/>
      <ellipse cy="-10" rx="6.5" ry="12" fill="#E8449B" transform="rotate(270)"/>
      <ellipse cy="-10" rx="6.5" ry="12" fill="#FF5C47" transform="rotate(315)"/>
    </g>
    <rect x="2.5" y="2.5" width="59" height="59" rx="13.5" fill="none" stroke="#000" stroke-opacity=".08"/>`),

  music: svg(`
    <defs>
      <linearGradient id="msc__ID__" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FF6A7F"/><stop offset="1" stop-color="#F6264C"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#msc__ID__)"/>
    <path d="M26 42V21.5l16-3.6V38" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="21.5" cy="42" rx="5.5" ry="4.6" fill="#fff"/>
    <ellipse cx="37.5" cy="38" rx="5.5" ry="4.6" fill="#fff"/>
    <rect x="2.5" y="2.5" width="59" height="59" rx="13.5" fill="none" stroke="#fff" stroke-opacity=".25"/>`),

  mail: svg(`
    <defs>
      <linearGradient id="mll__ID__" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
        <stop stop-color="#5CB8FF"/><stop offset="1" stop-color="#1A6FE0"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#mll__ID__)"/>
    <rect x="13" y="20" width="38" height="24" rx="4" fill="#fff"/>
    <path d="M14.5 22.5L32 35l17.5-12.5" fill="none" stroke="#2F86E8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="2.5" y="2.5" width="59" height="59" rx="13.5" fill="none" stroke="#fff" stroke-opacity=".25"/>`),

  // Deskmate ships its own mark: the cup from desk-mate.ai/favicon.svg.
  deskmate: svg(`
    <rect x="2" y="2" width="60" height="60" rx="14" fill="#FAF3E9"/>
    <g transform="translate(32 33) scale(.84) translate(-32 -32)">
      <g transform="translate(1 6)">
        <path d="M12 18C12 16.5 13.5 15 15 15h24c1.5 0 3 1.5 3 3l1 26c0 3.5-3 6-6 6H17c-3 0-6-2.5-6-6z" fill="#D94030" stroke="#1A1A2E" stroke-width="3" stroke-linejoin="round"/>
        <path d="M42 23c6 0 9 4.5 9 9.5S48 41 42 41" fill="none" stroke="#1A1A2E" stroke-width="3" stroke-linecap="round"/>
        <path d="M22 13c-1-4.5 2-7 1-11" fill="none" stroke="#1A1A2E" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M33 12c1-4.5-2-6.5 0-10.5" fill="none" stroke="#1A1A2E" stroke-width="2.5" stroke-linecap="round"/>
      </g>
    </g>
    <rect x="2.5" y="2.5" width="59" height="59" rx="13.5" fill="none" stroke="#000" stroke-opacity=".1"/>`),

  trash: svg(`
    <defs>
      <linearGradient id="trb__ID__" x1="16" y1="32" x2="48" y2="32" gradientUnits="userSpaceOnUse">
        <stop stop-color="#EDF2F7" stop-opacity=".85"/><stop offset=".5" stop-color="#9FAAB6" stop-opacity=".6"/><stop offset="1" stop-color="#EDF2F7" stop-opacity=".85"/>
      </linearGradient>
    </defs>
    <path d="M27 10h10a2.5 2.5 0 012.5 2.5V15h-15v-2.5A2.5 2.5 0 0127 10z" fill="#C6CFD8" opacity=".8"/>
    <rect x="11" y="16" width="42" height="5.5" rx="2.75" fill="#D7DEE6" opacity=".85"/>
    <path d="M16 24h32l-3 29.5a4 4 0 01-4 3.5H23a4 4 0 01-4-3.5z" fill="url(#trb__ID__)"/>
    <path d="M16 24h32l-3 29.5a4 4 0 01-4 3.5H23a4 4 0 01-4-3.5z" fill="none" stroke="#E3EAF1" stroke-opacity=".75" stroke-width="1.6"/>
    <g stroke="#E3EAF1" stroke-opacity=".55" stroke-width="1.5" stroke-linecap="round">
      <path d="M25.5 29l1.2 23M32 29v23M38.5 29l-1.2 23"/>
    </g>`),
};

// Fresh gradient ids on every injection.
let n = 0;
export const art = name => (appIcons[name] || '').replaceAll('__ID__', `-${++n}`);
export const hasArt = name => Boolean(appIcons[name]);
