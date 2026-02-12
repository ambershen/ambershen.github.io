// visuals/script.js
(function() {
  const records = Array.from(document.querySelectorAll('.vinyl-record'));
  const player = document.getElementById('main-player');
  const placeholder = document.querySelector('.player-placeholder');
  const playerContainer = document.querySelector('.player-container');

  let activeRecord = null;

  records.forEach(record => {
    record.addEventListener('click', () => {
      const videoSrc = record.getAttribute('data-video');
      const color = record.getAttribute('data-color');

      // If clicking the already-active record, do nothing
      if (record === activeRecord) return;

      // Deactivate previous
      if (activeRecord) {
        activeRecord.classList.remove('active');
      }

      // Activate clicked
      record.classList.add('active');
      activeRecord = record;

      // Accent the player border
      if (color) {
        playerContainer.style.borderColor = color;
      }

      // Play video
      if (videoSrc) {
        player.src = videoSrc;
        player.style.display = 'block';
        placeholder.style.display = 'none';

        var playPromise = player.play();
        if (playPromise !== undefined) {
          playPromise.catch(function() {
            // Autoplay blocked — user can click play manually
          });
        }
      }
    });
  });
})();
