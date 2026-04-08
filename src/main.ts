import './style.css';

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.setAttribute('data-theme', 'dark');
}

const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

function updateToggleIcon() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const icon = isDark ? '&#9788;' : '&#9790;';
  if (themeToggle) themeToggle.innerHTML = icon;
  if (mobileThemeToggle) mobileThemeToggle.innerHTML = icon;
}
updateToggleIcon();

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateToggleIcon();
}

themeToggle?.addEventListener('click', toggleTheme);
mobileThemeToggle?.addEventListener('click', toggleTheme);

// Mobile menu
const hamburger = document.getElementById('mobile-hamburger');
const leftColumn = document.getElementById('left-column');
const overlay = document.getElementById('mobile-overlay');
const breadcrumb = document.getElementById('mobile-breadcrumb');

function openMobileMenu() {
  leftColumn?.classList.add('open');
  hamburger?.classList.add('open');
  overlay?.classList.add('visible');
}

function closeMobileMenu() {
  leftColumn?.classList.remove('open');
  hamburger?.classList.remove('open');
  overlay?.classList.remove('visible');
}

function setBreadcrumb(text: string) {
  if (breadcrumb) breadcrumb.textContent = text;
}

hamburger?.addEventListener('click', () => {
  leftColumn?.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
});

overlay?.addEventListener('click', closeMobileMenu);

// Nav section scroll-to
document.querySelectorAll<HTMLElement>('[data-scroll-to]').forEach((el) => {
  el.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) return;
    const targetId = el.dataset.scrollTo;
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.innerWidth <= 1024) closeMobileMenu();
    }
  });
});

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

// View switching
const defaultView = document.getElementById('default-view');
const artGallery = document.getElementById('art-gallery');
const connectView = document.getElementById('connect-view');
const rightColumn = document.querySelector('.right-column');

function hideAllViews() {
  if (defaultView) defaultView.style.display = 'none';
  if (artGallery) artGallery.style.display = 'none';
  if (connectView) connectView.style.display = 'none';
  rightColumn?.querySelectorAll('.product-detail').forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });
}

function showProduct(productId: string) {
  if (!rightColumn) return;
  hideAllViews();
  const target = document.getElementById(productId);
  if (target) {
    target.style.display = 'flex';
    rightColumn.scrollTop = 0;
    const title = target.querySelector('.product-title');
    if (title) setBreadcrumb(title.textContent || 'Project');
  }
  closeMobileMenu();
}

function showGallery(scrollToRoom?: string) {
  if (!rightColumn || !artGallery) return;
  hideAllViews();
  artGallery.style.display = 'flex';
  rightColumn.scrollTop = 0;
  setBreadcrumb('I Make Arts');
  closeMobileMenu();
  if (scrollToRoom) {
    setTimeout(() => {
      const room = document.getElementById(scrollToRoom);
      if (room) room.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
}

function showDefault() {
  if (!rightColumn) return;
  hideAllViews();
  if (defaultView) defaultView.style.display = '';
  rightColumn.scrollTop = 0;
  setBreadcrumb('Amber Shen');
  closeMobileMenu();
}

document.querySelectorAll<HTMLElement>('[data-show-product]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const productId = el.dataset.showProduct;
    if (productId) showProduct(productId);
  });
});

document.querySelectorAll<HTMLElement>('[data-show-default]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    showDefault();
  });
});

// Sidebar "I Make Arts" click → show gallery
document.querySelector('[data-scroll-to="art"]')?.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a')) return;
  e.stopPropagation();
  showGallery();
});

// Sidebar sub-links scroll to rooms
document.querySelectorAll<HTMLElement>('[data-scroll-room]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const roomId = el.dataset.scrollRoom;
    if (roomId) showGallery(roomId);
  });
});

// Carousel
document.querySelectorAll<HTMLElement>('.product-carousel').forEach((carousel) => {
  const images = carousel.querySelectorAll<HTMLImageElement>('.carousel-track img');
  const counter = carousel.querySelector('.carousel-counter');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  let current = 0;

  if (images.length > 0) images[0].classList.add('active');

  function show(index: number) {
    images[current].classList.remove('active');
    current = (index + images.length) % images.length;
    images[current].classList.add('active');
    if (counter) counter.textContent = `${current + 1} / ${images.length}`;
  }

  prevBtn?.addEventListener('click', () => show(current - 1));
  nextBtn?.addEventListener('click', () => show(current + 1));
});

// "I Connect Worlds" → show connect view
document.getElementById('nav-connect')?.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a')) return;
  hideAllViews();
  if (connectView) {
    connectView.style.display = 'flex';
    if (rightColumn) rightColumn.scrollTop = 0;
  }
  setBreadcrumb('I Connect Worlds');
  closeMobileMenu();
});

// Lightbox (Salon wall)
document.querySelectorAll<HTMLElement>('.salon-piece').forEach((piece) => {
  piece.addEventListener('click', () => {
    const img = piece.querySelector('img');
    const caption = piece.querySelector('.salon-caption');
    if (!img) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <img src="${img.src}" alt="${img.alt}" />
      <span class="lightbox-caption">${caption?.textContent || ''}</span>
    `;
    document.body.appendChild(lightbox);
    requestAnimationFrame(() => lightbox.classList.add('visible'));

    lightbox.addEventListener('click', () => {
      lightbox.classList.remove('visible');
      setTimeout(() => lightbox.remove(), 300);
    });
  });
});

// Screening room — play video on hover
document.querySelectorAll<HTMLVideoElement>('.screening-piece video').forEach((video) => {
  video.addEventListener('mouseenter', () => video.play());
  video.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
  });
});

// Auto-scroll if navigated via hash
if (window.location.hash) {
  const target = document.querySelector(window.location.hash);
  if (target) {
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}
