document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const links = document.querySelectorAll('.menu-button');
  const wrapper = document.getElementById('slideshow-wrapper');
  const galleryTitle = document.getElementById('gallery-title');

  const imgElement = document.getElementById('current-image');
  const titleElement = document.getElementById('slide-title');
  const descElement = document.getElementById('slide-desc');
  const nextBtn = document.getElementById('next-button');
  const prevBtn = document.getElementById('prev-button');

  // Ensure the parent of the image is relative so we can stack images for the cross-fade
  if (imgElement && imgElement.parentNode) {
    imgElement.parentNode.style.position = 'relative';
    imgElement.parentNode.style.overflow = 'hidden'; // optional, keeps things tidy
  }

  // --- Slideshow State ---
  let currentImages = [];
  let currentIndex = 0;
  let isAnimating = false; // Prevents button spamming

  // --- 1. Handle Menu Clicks ---
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Prevent clicking if a transition is active
      if (isAnimating) return;

      // Active styling
      links.forEach((l) => l.classList.remove('active'));
      link.classList.add('active'); // Uncommented this for visual feedback

      const folderName = link.getAttribute('data-page');
      const friendlyName = link.textContent.trim();

      loadImages(folderName, friendlyName);
    });
  });

  // --- 2. Fetch Images ---
  function loadImages(folder, name) {
    galleryTitle.textContent = `Loading ${name}...`;
    // Fade wrapper out slightly while loading new gallery, or keep it simpler:
    wrapper.style.opacity = '0.5';

    fetch(`get_images.php?folder=${encodeURIComponent(folder)}`)
      .then((response) => response.json())
      .then((data) => {
        wrapper.style.opacity = '1';

        if (data.error) {
          galleryTitle.textContent = 'Error: ' + data.error;
          return;
        }

        if (!Array.isArray(data) || data.length === 0) {
          galleryTitle.textContent = `No images found in ${name}.`;
          return;
        }

        // Success: initialize slideshow
        currentImages = data;
        currentIndex = 0;

        galleryTitle.textContent = name;
        wrapper.style.display = 'flex';

        // Force immediate display for first image (no cross-fade needed)
        const firstSlide = currentImages[0];
        imgElement.src = firstSlide.path;
        titleElement.textContent = firstSlide.title || '';
        descElement.textContent = firstSlide.description || '';
      })
      .catch((err) => {
        console.error('Gallery load error:', err);
        galleryTitle.textContent = 'Error loading gallery.';
        wrapper.style.opacity = '1';
      });
  }

  // --- 3. Cross-Fade Display Logic ---
  function displaySlide(index) {
    const slide = currentImages[index];
    if (!slide || isAnimating) return;

    isAnimating = true; // Lock animations

    // 1. Create a temporary "Overlay" image
    const overlayImg = document.createElement('img');
    overlayImg.src = slide.path;

    // Style it to sit exactly on top of the current image
    overlayImg.style.position = 'absolute';
    overlayImg.style.top = '0';
    overlayImg.style.left = '0';
    overlayImg.style.width = '100%';
    overlayImg.style.height = '100%';
    overlayImg.style.objectFit = 'contain'; // Ensure it matches your CSS
    overlayImg.style.opacity = '0';
    overlayImg.style.transition = 'opacity 0.5s ease-in-out'; // The dissolve speed
    overlayImg.style.zIndex = '10';

    // 2. Append to the container
    imgElement.parentNode.appendChild(overlayImg);

    // 3. Wait for the image to actually load before fading
    overlayImg.onload = () => {
      // Trigger reflow to ensure transition happens
      overlayImg.getBoundingClientRect();

      // Start Fade In
      overlayImg.style.opacity = '1';

      // 4. Update text immediately or halfway through (optional)
      titleElement.textContent = slide.title || '';
      descElement.textContent = slide.description || '';

      // 5. Cleanup after transition
      setTimeout(() => {
        // Swap the "real" image source
        imgElement.src = slide.path;

        // Remove the overlay
        overlayImg.remove();

        isAnimating = false; // Unlock
      }, 550); // Slightly longer than the CSS transition (0.5s)
    };

    // Fallback: If image fails to load, unlock interface
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
