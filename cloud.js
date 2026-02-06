// Envelope Opening Animation
(function() {
  const envelopeLanding = document.getElementById('envelope-landing');
  const envelopeFlap = document.querySelector('.envelope-flap');
  const letterWrapper = document.querySelector('.letter-wrapper');

  if (!envelopeLanding || !envelopeFlap || !letterWrapper) return;

  envelopeFlap.addEventListener('click', function() {
    // Open the envelope flap
    envelopeFlap.classList.add('open');

    // After flap opens, fade out envelope and show letter
    setTimeout(function() {
      envelopeLanding.classList.add('opened');
      letterWrapper.classList.add('visible');
    }, 600);

    // Fully hide envelope after transition
    setTimeout(function() {
      envelopeLanding.style.display = 'none';
    }, 1500);
  });
})();
