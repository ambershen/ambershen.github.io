// visuals/script.js
(function() {
  const carousel = document.querySelector('.carousel');
  const items = Array.from(document.querySelectorAll('.carousel-item'));
  const player = document.getElementById('main-player');
  const playerPlaceholder = document.querySelector('.player-placeholder');
  
  const radius = 400; // Radius of the carousel
  const itemCount = items.length;
  const anglePerItem = 360 / itemCount;
  
  let currentRotation = 0;
  let currentIndex = 0;

  // Initial setup
  items.forEach((item, index) => {
    // Position items
    const angle = index * anglePerItem;
    item.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
    
    // Click event
    item.addEventListener('click', () => {
      // If clicked item is already active, maybe toggle play/pause?
      // For now, just rotate to it and play.
      rotateToItem(index);
      const videoSrc = item.getAttribute('data-video');
      if (videoSrc) {
        playVideo(videoSrc);
      }
    });
  });

  function rotateToItem(index) {
    // Calculate shortest path
    let diff = index - currentIndex;
    
    // Normalize diff to -itemCount/2 to itemCount/2
    if (diff > itemCount / 2) {
      diff -= itemCount;
    } else if (diff < -itemCount / 2) {
      diff += itemCount;
    }
    
    // Update rotation
    currentRotation -= diff * anglePerItem;
    currentIndex = index;
    
    // Apply transform
    carousel.style.transform = `translateZ(-${radius}px) rotateY(${currentRotation}deg)`;
    
    // Update active class
    items.forEach(i => i.classList.remove('active'));
    items[index].classList.add('active');
  }

  function playVideo(src) {
    if (!src) return;
    
    // Check if it's the same video
    if (player.src.includes(src) && player.style.display === 'block') {
      return;
    }

    player.src = src;
    player.style.display = 'block';
    playerPlaceholder.style.display = 'none';
    
    // Attempt to play
    const playPromise = player.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Auto-play prevented:', error);
      });
    }
  }

  // Initialize: Rotate to first item (0)
  // We set initial transform explicitly to ensure transition starts correctly
  carousel.style.transform = `translateZ(-${radius}px) rotateY(0deg)`;
  items[0].classList.add('active');

})();
