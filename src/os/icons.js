// Line glyphs in the same hand as the peony mark. 32×32 viewBox.
const g = d => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const icons = {
  flower: g('<path d="M16 15c-3-6 1-10 0-11-1 1 3 5 0 11M16 15c5-4 9-2 10-3-1-1-5-2-10 3M16 15c-5-4-9-2-10-3 1-1 5-2 10 3M16 15c4 3 4 8 6 9-2 0-5-3-6-9M16 15c-4 3-4 8-6 9 2 0 5-3 6-9"/><circle cx="16" cy="15" r="1.6"/><path d="M16 21v8"/>'),
  window: g('<rect x="5" y="5" width="22" height="22" rx="1.5"/><path d="M16 5v22M5 16h22"/><path d="M8 9c2-1 3 1 5 0M19 20c2-1 3 1 5 0" opacity=".6"/>'),
  crystal: g('<path d="M16 3l7 8-7 18-7-18z"/><path d="M9 11h14M16 3v26M12 11l4 18 4-18"/>'),
  poem: g('<path d="M6 8c4-2 6 2 10 0s6 2 10 0M6 14c4-2 6 2 10 0s6 2 10 0"/><path d="M8 21h16M10 25h12" opacity=".7"/>'),
  glyph: g('<circle cx="16" cy="16" r="10"/><path d="M16 6c-4 4-4 16 0 20M16 6c4 4 4 16 0 20M6 16h20"/>'),
  place: g('<path d="M16 28s-8-8-8-14a8 8 0 0116 0c0 6-8 14-8 14z"/><circle cx="16" cy="14" r="3"/>'),
  tunnel: g('<rect x="4" y="6" width="24" height="20" rx="1"/><rect x="9" y="10" width="14" height="12"/><rect x="13" y="13" width="6" height="6"/><path d="M4 6l9 7M28 6l-9 7M4 26l9-7M28 26l-9-7"/>'),
  folder: g('<path d="M4 9h9l2 3h13v14H4z"/><path d="M4 13h24" opacity=".6"/>'),
  photo: g('<rect x="4" y="7" width="24" height="18" rx="1"/><path d="M4 21l7-7 6 6 4-4 7 7"/><circle cx="21" cy="12" r="2"/>'),
  film: g('<rect x="4" y="7" width="24" height="18" rx="1"/><path d="M14 12v8l6-4z"/><path d="M4 11h3M4 16h3M4 21h3M25 11h3M25 16h3M25 21h3" opacity=".6"/>'),
  note: g('<path d="M8 4h12l5 5v19H8z"/><path d="M20 4v5h5M12 14h9M12 18h9M12 22h6"/>'),
  letter: g('<rect x="4" y="8" width="24" height="16" rx="1"/><path d="M4 9l12 9 12-9"/>'),
  desk: g('<path d="M4 14h24M7 14v12M25 14v12"/><rect x="11" y="6" width="10" height="8" rx="1"/><path d="M16 14v-1"/>'),
  book: g('<path d="M16 8c-3-2-8-2-11-1v18c3-1 8-1 11 1 3-2 8-2 11-1V7c-3-1-8-1-11 1zM16 8v18"/>'),
  music: g('<path d="M13 24V9l12-3v15"/><ellipse cx="9.5" cy="24" rx="4" ry="3.2"/><ellipse cx="21.5" cy="21" rx="4" ry="3.2"/><path d="M13 13l12-3" opacity=".6"/>'),
  finder: g('<rect x="5" y="5" width="22" height="22" rx="3"/><path d="M11 13v3M21 13v3M11 22c3 2 7 2 10 0"/>'),
  trash: g('<path d="M7 10h18l-1.6 17H8.6z"/><path d="M12 7h8l1 3H11z"/><path d="M13 15v7M16 15v7M19 15v7" opacity=".6"/>'),
  tool: g('<path d="M19 5a6 6 0 00-5 9.5L6 22.5 9.5 26l8-8A6 6 0 1019 5z"/><circle cx="19" cy="11" r="2.2"/>'),
  case: g('<rect x="4" y="10" width="24" height="15" rx="1.5"/><path d="M12 10V7h8v3"/><path d="M4 16h24" opacity=".6"/>'),
};
