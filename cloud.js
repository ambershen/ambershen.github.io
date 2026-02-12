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

  // ========== ME IMAGE TOGGLE ==========
  const meTrigger = document.getElementById('me-trigger');
  const meImg = document.getElementById('me-img');

  if (meTrigger && meImg) {
    meTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      meImg.classList.toggle('visible');
    });
  }

  // ========== PAINT IMAGE TOGGLE ==========
  const paintTrigger = document.getElementById('paint-trigger');
  const paintImg = document.getElementById('paint-img');

  if (paintTrigger && paintImg) {
    paintTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      paintImg.classList.toggle('visible');
    });
  }

  // ========== VIDEO AUTOPLAY ON INTERSECTION ==========
  const videos = document.querySelectorAll('video');
  if ('IntersectionObserver' in window && videos.length > 0) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.play().catch(e => console.log('Autoplay prevented:', e));
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.5 });

    videos.forEach(video => {
      videoObserver.observe(video);
    });
  }

  // ========== MEDIA MODAL / LIGHTBOX WITH CAROUSEL ==========
  const modal = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-media-container');
  const closeModal = document.querySelector('.close-modal');
  const prevBtn = document.querySelector('.modal-prev');
  const nextBtn = document.querySelector('.modal-next');
  const counterEl = document.querySelector('.modal-counter');

  let modalItems = [];   // Array of media elements from the current project carousel
  let modalIndex = 0;    // Current index within that carousel

  function showModalItem(index) {
    modalIndex = index;
    modalContent.innerHTML = '';

    var source = modalItems[index];
    var clone = source.cloneNode(true);

    if (clone.tagName === 'VIDEO') {
      clone.controls = true;
      clone.autoplay = true;
      clone.muted = false;
      clone.loop = true;
      clone.removeAttribute('style');
    }

    modalContent.appendChild(clone);

    // Update counter
    counterEl.textContent = (index + 1) + ' / ' + modalItems.length;

    // Show/hide arrows
    prevBtn.style.display = modalItems.length > 1 ? '' : 'none';
    nextBtn.style.display = modalItems.length > 1 ? '' : 'none';
  }

  function openModal(carouselEl, clickedMedia) {
    // Gather all media in this project's carousel
    modalItems = Array.from(carouselEl.querySelectorAll('img, video'));
    var startIndex = modalItems.indexOf(clickedMedia);
    if (startIndex < 0) startIndex = 0;

    showModalItem(startIndex);
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    modal.classList.remove('visible');
    document.body.style.overflow = '';

    var video = modalContent.querySelector('video');
    if (video) video.pause();

    setTimeout(function() { modalContent.innerHTML = ''; }, 300);
    modalItems = [];
    modalIndex = 0;
  }

  function modalPrev() {
    if (modalItems.length === 0) return;
    var video = modalContent.querySelector('video');
    if (video) video.pause();
    showModalItem((modalIndex - 1 + modalItems.length) % modalItems.length);
  }

  function modalNext() {
    if (modalItems.length === 0) return;
    var video = modalContent.querySelector('video');
    if (video) video.pause();
    showModalItem((modalIndex + 1) % modalItems.length);
  }

  if (modal && modalContent) {
    // Attach click to each media item inside project carousels
    document.querySelectorAll('.project-carousel img, .project-carousel video').forEach(function(media) {
      media.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var carousel = media.closest('.project-carousel');
        if (carousel) openModal(carousel, media);
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', function(e) { e.stopPropagation(); modalPrev(); });
    if (nextBtn) nextBtn.addEventListener('click', function(e) { e.stopPropagation(); modalNext(); });
    if (closeModal) closeModal.addEventListener('click', hideModal);

    modal.addEventListener('click', function(e) {
      if (e.target === modal) hideModal();
    });

    document.addEventListener('keydown', function(e) {
      if (!modal.classList.contains('visible')) return;
      if (e.key === 'Escape') hideModal();
      if (e.key === 'ArrowLeft') modalPrev();
      if (e.key === 'ArrowRight') modalNext();
    });
  }
})();


