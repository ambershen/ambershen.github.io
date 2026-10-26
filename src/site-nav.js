import {flowerMark} from './flower-mark.js';
import {themeToggle} from './theme.js';

// Header nav for standalone pages (case studies). Mirrors the nav in /index.html.
export const navItems = [
  {page: 'products', label: 'Work', href: '/#work'},
  {page: 'art', label: 'Gallery', href: '/#gallery'},
  {page: 'film', label: 'Film', href: '/#film'},
  {page: 'writing', label: 'Writing', href: '/#writing'},
];

export function renderNav(current) {
  const header = document.createElement('header');
  header.className = 'site-header';
  const links = navItems.map(item =>
    `<a class="collection" href="${item.href}"${item.page === current ? ' aria-current="page"' : ''}>${item.label}</a>`).join('');
  header.innerHTML = `<nav class="header-nav" aria-label="Explore my work"><a class="collection home-flower" href="/" aria-label="Home" title="Home">${flowerMark}</a>${links}</nav>`;
  header.append(themeToggle());
  return header;
}
