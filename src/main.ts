import './style.css';
import { initSidebar } from './sidebar';

initSidebar();

// Fade-in on scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1 }
);
document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

// Expandable project cards
document.querySelectorAll<HTMLElement>('[data-project-toggle]').forEach((header) => {
  header.addEventListener('click', () => {
    const item = header.closest('[data-project]');
    if (!item) return;
    item.classList.toggle('expanded');
  });
});

// Auto-expand if navigated to via hash
if (window.location.hash) {
  const target = document.querySelector(window.location.hash);
  if (target?.hasAttribute('data-project')) {
    target.classList.add('expanded');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
