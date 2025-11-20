document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const links = document.querySelectorAll('.menu-button');
  const wrapper = document.getElementById('slideshow-wrapper');

  // SAFE GUARD: We try to find the title, but we won't crash if it's missing
  const galleryTitle = document.getElementById('gallery-title');

  const imgElement = document.getElementById('current-image');
  const titleElement = document.getElementById('slide-title');
  const descElement = document.getElementById('slide-desc');
  const nextBtn = document.getElementById('next-button');
  const prevBtn = document.getElementById('prev-button');

  // Ensure the parent of the image is relative so we can stack images for the cross-fade
  if (imgElement && imgElement.parentNode) {
    imgElement.parentNode.style.position = 'relative';
    imgElement.parentNode.style.overflow = 'hidden';
  }

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
    // SAFETY CHECK: Only update text if the element actually exists
    if (galleryTitle) {
      galleryTitle.textContent = `Loading ${name}...`;
    }

    if (wrapper) wrapper.style.opacity = '0.5';

    fetch(`get_images.php?folder=${encodeURIComponent(folder)}`)
      .then((response) => response.json())
      .then((data) => {
        if (wrapper) wrapper.style.opacity = '1';

        if (data.error) {
          if (galleryTitle) galleryTitle.textContent = 'Error: ' + data.error;
          return;
        }

        if (!Array.isArray(data) || data.length === 0) {
          if (galleryTitle) galleryTitle.textContent = `No images found in ${name}.`;
          return;
        }

        // Success: initialize slideshow
        currentImages = data;
        currentIndex = 0;

        if (galleryTitle) galleryTitle.textContent = name;
        if (wrapper) wrapper.style.display = 'flex';

        // Force immediate display for first image
        const firstSlide = currentImages[0];
        if (imgElement) {
          imgElement.src = firstSlide.path;
        }
        if (titleElement) titleElement.textContent = firstSlide.title || '';
        if (descElement) descElement.textContent = firstSlide.description || '';
      })
      .catch((err) => {
        console.error('Gallery load error:', err);
        if (galleryTitle) galleryTitle.textContent = 'Error loading gallery.';
        if (wrapper) wrapper.style.opacity = '1';
      });
  }

  // --- 3. Cross-Fade Display Logic ---
  function displaySlide(index) {
    const slide = currentImages[index];
    if (!slide || isAnimating || !imgElement) return;

    isAnimating = true;

    // 1. Create a temporary "Overlay" image
    const overlayImg = document.createElement('img');
    overlayImg.src = slide.path;

    // Style it to sit exactly on top of the current image
    overlayImg.style.position = 'absolute';
    overlayImg.style.top = '0';
    overlayImg.style.left = '0';
    overlayImg.style.width = '100%';
    overlayImg.style.height = '100%';
    overlayImg.style.objectFit = 'contain';
    overlayImg.style.opacity = '0';
    overlayImg.style.transition = 'opacity 0.5s ease-in-out';
    overlayImg.style.zIndex = '10';

    imgElement.parentNode.appendChild(overlayImg);

    // 3. Wait for the image to actually load before fading
    overlayImg.onload = () => {
      overlayImg.getBoundingClientRect(); // Trigger reflow
      overlayImg.style.opacity = '1';

      if (titleElement) titleElement.textContent = slide.title || '';
      if (descElement) descElement.textContent = slide.description || '';

      setTimeout(() => {
        imgElement.src = slide.path;
        overlayImg.remove();
        isAnimating = false;
      }, 550);
    };

    overlayImg.onerror = () => {
      console.error('Failed to load image for transition');
      overlayImg.remove();
      isAnimating = false;
    };
  }

  // --- 4. Navigation Buttons ---
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

  // --- 5. Auto-load First Gallery ---
  const firstLink = document.querySelector('.menu-button');
  if (firstLink) {
    firstLink.click();
  }
});
