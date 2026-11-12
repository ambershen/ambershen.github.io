import {about} from './data/about.js';
import './about.css';

function el(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text) element.textContent = text;
  return element;
}
export function aboutPage() {
  const page = el('div', 'about-page');
  const intro = el('div', 'about-intro');
  intro.append(el('p', 'about-lead', about.intro));
  page.append(intro);
  for (const section of about.sections.filter(section => !section.hidden && section.entries.length)) {
    const block = el('section', 'about-section');
    const heading = el('h3', 'about-section-title', section.title);
    heading.id = 'about-' + section.title.toLowerCase().replace(/[^a-z]+/g, '-');
    block.setAttribute('aria-labelledby', heading.id);
    block.append(heading);
    const list = el('ul', 'about-list');
    for (const [date, organization, role] of section.entries) {
      const row = el('li', 'about-entry');
      if (section.title === 'Education') {
        row.append(el('span', 'about-date', date + ' '), el('strong', 'about-organization', organization + ', ' + role));
      } else {
        if (date) row.append(el('span', 'about-date', date + ', '));
        row.append(el('span', 'about-role', role + ', '), el('span', 'about-organization', organization));
      }
      list.append(row);
    }
    block.append(list);
    page.append(block);
  }
  return page;
}
