document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const links = document.querySelectorAll('.menu-button');
  const wrapper = document.getElementById('slideshow-wrapper');

  // The container for our stacking images
  const imageStage = document.getElementById('image-stage');

  // We treat the first image we find as the "current" one
  let currentImgElement = document.getElementById('current-image');

  const galleryTitle = document.getElementById('gallery-title');
  const titleElement = document.getElementById('slide-title');
  const descElement = document.getElementById('slide-desc');
  const nextBtn = document.getElementById('next-button');
  const prevBtn = document.getElementById('prev-button');

  // --- Slideshow State ---
  let currentImages = [];
  let currentIndex = 0;
  let isAnimating = false;

  // --- 1. Handle Menu Clicks ---
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (isAnimating) return;

      links.forEach((l) => l.classList.remove('active'));
      // link.classList.add('active');

      const folderName = link.getAttribute('data-page');
      const friendlyName = link.textContent.trim();
      loadImages(folderName, friendlyName);
    });
  });

  // --- 2. Fetch Images ---
  function loadImages(folder, name) {
    if (galleryTitle) galleryTitle.textContent = `Loading ${name}...`;
    if (wrapper) wrapper.style.opacity = '0.5';

    fetch(`get_images.php?folder=${encodeURIComponent(folder)}`)
      .then((response) => response.json())
      .then((data) => {
        if (wrapper) wrapper.style.opacity = '1';

        if (data.error || !Array.isArray(data) || data.length === 0) {
          if (galleryTitle) galleryTitle.textContent = data.error || `No images in ${name}.`;
          return;
        }

        // Success
        currentImages = data;
        currentIndex = 0;
        if (galleryTitle) galleryTitle.textContent = name;
        if (wrapper) wrapper.style.display = 'flex';

        // Force immediate display for first image (no animation needed)
        displaySlide(0, false);
      })
      .catch((err) => {
        console.error(err);
        if (galleryTitle) galleryTitle.textContent = 'Error loading gallery.';
        if (wrapper) wrapper.style.opacity = '1';
      });
  }

  // --- 3. Smooth Cross-Fade Logic ---
  function displaySlide(index, animate = true) {
    const slide = currentImages[index];
    if (!slide || !imageStage) return;

    // Update Text Info Immediately
    if (titleElement) titleElement.textContent = slide.title || '';
    if (descElement) descElement.textContent = slide.description || '';

    // If simply loading the first image, just set it and exit
    if (!animate) {
      if (currentImgElement) currentImgElement.src = slide.path;
      return;
    }

    // LOCK animations to prevent button mashing
    isAnimating = true;

    // 1. Create New Image
    const nextImg = document.createElement('img');
    nextImg.src = slide.path;
    nextImg.style.opacity = '0'; // Start invisible
    nextImg.classList.add('fading-in');

    // 2. Append to Grid Stage
    imageStage.appendChild(nextImg);

    // 3. Wait for browser to register the new element (Pre-fade logic)
    requestAnimationFrame(() => {
      // Force browser to calculate layout
      nextImg.getBoundingClientRect();

      // Start Fade In
      nextImg.style.opacity = '1';

      // Fade Out Old Image (if it exists)
      if (currentImgElement) {
        currentImgElement.classList.add('fading-out');
      }
    });

    // 4. Clean up after CSS transition (0.6s)
    setTimeout(() => {
      // Remove the old image from DOM entirely
      if (currentImgElement && currentImgElement.parentNode) {
        currentImgElement.remove();
      }

      // The "Next" image now becomes the "Current" image
      currentImgElement = nextImg;
      currentImgElement.classList.remove('fading-in'); // Reset class

      isAnimating = false; // Unlock
    }, 650); // Wait slightly longer than CSS transition (600ms)
  }

  // --- 4. Navigation ---
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (isAnimating) return;
      currentIndex = (currentIndex + 1) % currentImages.length;
      displaySlide(currentIndex);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (isAnimating) return;
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      displaySlide(currentIndex);
    });
  }

  // Auto-load first gallery
  const firstLink = document.querySelector('.menu-button');
  if (firstLink) firstLink.click();
});
