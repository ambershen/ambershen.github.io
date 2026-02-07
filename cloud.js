// Envelope Opening Animation
(function() {
  const envelopeLanding = document.getElementById('envelope-landing');
  const cloudContainer = document.querySelector('.cloud-container');
  const letterWrapper = document.querySelector('.letter-wrapper');

  if (!envelopeLanding || !cloudContainer || !letterWrapper) return;

  cloudContainer.addEventListener('click', function() {
    // Add opening class to start animations if any
    cloudContainer.classList.add('open');

    // Fade out envelope and show letter
    // Reduced timeout since we don't have the flap animation anymore
    setTimeout(function() {
      envelopeLanding.classList.add('opened');
      letterWrapper.classList.add('visible');
    }, 300);

    // Fully hide envelope after transition
    setTimeout(function() {
      envelopeLanding.style.display = 'none';
    }, 1200);
  });

  // Snowboard Image Toggle
  const snowboardTrigger = document.getElementById('snowboard-trigger');
  const snowboardImg = document.getElementById('snowboard-img');

  if (snowboardTrigger && snowboardImg) {
    snowboardTrigger.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default anchor behavior
      if (snowboardImg.classList.contains('visible')) {
        snowboardImg.classList.remove('visible');
        // Wait for animation to finish before hiding (optional, but css handles display:none)
        // For simplicity, we toggle class which handles display via CSS
      } else {
        snowboardImg.classList.add('visible');
      }
    });
  }
})();
