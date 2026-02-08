// Envelope Opening Animation & Brain Slider
(function() {
  const envelopeLanding = document.getElementById('envelope-landing');
  const cloudContainer = document.querySelector('.cloud-container');
  const sliderWrapper = document.querySelector('.brain-slider-wrapper');
  const slider = document.querySelector('.brain-slider');
  const navDots = document.querySelectorAll('.nav-dot[data-panel]');

  let currentPanel = 1; // Start at center (intro)
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;
  const SWIPE_THRESHOLD = 50;

  // ========== ENVELOPE OPENING ==========
  if (envelopeLanding && cloudContainer && sliderWrapper) {
    cloudContainer.addEventListener('click', function() {
      cloudContainer.classList.add('open');

      setTimeout(function() {
        envelopeLanding.classList.add('opened');
        sliderWrapper.classList.add('visible');
      }, 300);

      setTimeout(function() {
        envelopeLanding.style.display = 'none';
      }, 1200);
    });
  }

  // ========== SLIDER NAVIGATION ==========
  function goToPanel(index) {
    // 3 panels: 0 (left brain), 1 (intro), 2 (right brain)
    if (index < 0 || index > 2) return;

    currentPanel = index;

    // Update slider position
    if (slider) {
      slider.setAttribute('data-active', index);
    }

    // Update nav dots
    navDots.forEach((dot) => {
      const panelIndex = parseInt(dot.getAttribute('data-panel'), 10);
      dot.classList.toggle('active', panelIndex === index);
    });
  }

  // Nav dot clicks
  navDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const panelIndex = parseInt(dot.getAttribute('data-panel'), 10);
      if (!isNaN(panelIndex)) {
        e.preventDefault();
        goToPanel(panelIndex);
      }
    });
  });

  // ========== TOUCH SWIPE (Mobile) ==========
  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
  }

  function handleTouchMove(e) {
    if (!isSwiping) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const diffX = touchStartX - touchCurrentX;
    const diffY = touchStartY - touchCurrentY;

    // If horizontal swipe is dominant, prevent vertical scroll
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      e.preventDefault();
    }
  }

  function handleTouchEnd(e) {
    if (!isSwiping) return;
    isSwiping = false;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only handle horizontal swipes
    if (Math.abs(diffX) < SWIPE_THRESHOLD || Math.abs(diffY) > Math.abs(diffX)) {
      return;
    }

    if (diffX > 0) {
      // Swipe left (finger moves left) -> go to next panel (right direction)
      goToPanel(currentPanel + 1);
    } else {
      // Swipe right (finger moves right) -> go to previous panel (left direction)
      goToPanel(currentPanel - 1);
    }
  }

  if (sliderWrapper) {
    sliderWrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
    sliderWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
    sliderWrapper.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  // ========== KEYBOARD NAVIGATION ==========
  document.addEventListener('keydown', function(e) {
    if (!sliderWrapper || !sliderWrapper.classList.contains('visible')) return;

    if (e.key === 'ArrowLeft') {
      goToPanel(currentPanel - 1);
    } else if (e.key === 'ArrowRight') {
      goToPanel(currentPanel + 1);
    }
  });

  // ========== MOUSE DRAG (Desktop) ==========
  let mouseStartX = 0;
  let isDragging = false;

  if (sliderWrapper) {
    sliderWrapper.addEventListener('mousedown', function(e) {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
      mouseStartX = e.clientX;
      isDragging = true;
      sliderWrapper.style.cursor = 'grabbing';
    });

    document.addEventListener('mouseup', function(e) {
      if (!isDragging) return;
      isDragging = false;
      sliderWrapper.style.cursor = '';

      const diffX = mouseStartX - e.clientX;
      if (Math.abs(diffX) < SWIPE_THRESHOLD) return;

      if (diffX > 0) {
        goToPanel(currentPanel + 1);
      } else {
        goToPanel(currentPanel - 1);
      }
    });

    sliderWrapper.addEventListener('mouseleave', function() {
      isDragging = false;
      sliderWrapper.style.cursor = '';
    });
  }

  // ========== TRACKPAD HORIZONTAL SCROLL ==========
  let lastWheelTime = 0;

  if (sliderWrapper) {
    sliderWrapper.addEventListener('wheel', function(e) {
      const now = Date.now();

      // Debounce wheel events
      if (now - lastWheelTime < 500) return;

      // Horizontal scroll (trackpad)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 30) {
        lastWheelTime = now;
        if (e.deltaX > 0) {
          goToPanel(currentPanel + 1);
        } else {
          goToPanel(currentPanel - 1);
        }
      }
    }, { passive: true });
  }

  // ========== SNOWBOARD IMAGE TOGGLE ==========
  const snowboardTrigger = document.getElementById('snowboard-trigger');
  const snowboardImg = document.getElementById('snowboard-img');

  if (snowboardTrigger && snowboardImg) {
    snowboardTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      snowboardImg.classList.toggle('visible');
    });
  }
})();
