const sections = [
  {
    title: 'I Build Things',
    items: [
      { name: 'Dirty Window', desc: 'interactive art', href: '/#dirty-window' },
      { name: 'PaletteMe', desc: 'AI color analysis', href: '/#paletteme' },
      { name: 'Birth Crystal', desc: 'generative 3D', href: '/#birth-crystal' },
      { name: 'Bento Box', desc: 'utility tools', href: '/#bento-box' },
      { name: 'TRAE Raffle', desc: 'gamified experience', href: '/#trae-raffle' },
      { name: 'Agent Skills', desc: 'AI extensions', href: '/#agent-skills' },
    ],
  },
  {
    title: 'I Make Art',
    items: [
      { name: 'Gallery', href: '/gallery/' },
      { name: 'Visuals', href: '/visuals/' },
    ],
  },
  {
    title: 'I Bring People Together',
    items: [
      { name: 'Non-AI AI Event', desc: 'SF community', href: '/#community' },
    ],
  },
];

export function initSidebar() {
  const container = document.getElementById('sidebar');
  if (!container) return;

  container.innerHTML = `
    <a href="/" class="sidebar__name">Amber Shen</a>
    <p class="sidebar__bio">
      Welcome :) I'm a creative technologist building at the intersection of product, narrative, and code.
    </p>
    ${sections.map(section => `
      <div class="sidebar__section">
        <h2 class="sidebar__section-title">${section.title}</h2>
        <ul class="sidebar__nav">
          ${section.items.map(item => `
            <li class="sidebar__nav-item">
              <a href="${item.href}">
                ${item.name}${item.desc ? `<span class="nav-desc">— ${item.desc}</span>` : ''}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('')}
    <div class="sidebar__footer">
      <ul class="sidebar__social">
        <li><a href="https://x.com/whosamberella" target="_blank" rel="noopener noreferrer">X</a></li>
        <li><a href="https://github.com/ambershen" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        <li><a href="https://www.linkedin.com/in/amber-hanzi-shen/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
      </ul>
    </div>
  `;

  // Mobile toggle
  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = container.classList.toggle('open');
      toggle.textContent = isOpen ? 'CLOSE' : 'MENU';
    });
    container.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          container.classList.remove('open');
          toggle.textContent = 'MENU';
        }
      });
    });
  }
}
