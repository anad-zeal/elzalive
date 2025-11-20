document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const links = document.querySelectorAll('.link-3');
  const wrapper = document.getElementById('slideshow-wrapper');
  const galleryTitle = document.getElementById('gallery-title');

  const imgElement = document.getElementById('current-image');
  const titleElement = document.getElementById('slide-title');
  const descElement = document.getElementById('slide-desc');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');

  // --- Slideshow State ---
  let currentImages = [];
  let currentIndex = 0;

  // --- 1. Handle Menu Clicks ---
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Active styling
      links.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');

      // Get data attributes
      const folderName = link.getAttribute('data_page');
      const friendlyName = link.textContent.trim();

      loadImages(folderName, friendlyName);
    });
  });

  // --- 2. Fetch Images ---
  function loadImages(folder, name) {
    galleryTitle.textContent = `Loading ${name}...`;
    wrapper.style.display = 'none';

    fetch(`get_images.php?folder=${encodeURIComponent(folder)}`)
      .then((response) => response.json())
      .then((data) => {
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

        displaySlide(currentIndex);
      })
      .catch((err) => {
        console.error('Gallery load error:', err);
        galleryTitle.textContent = 'Error loading gallery.';
      });
  }

  // --- 3. Display Logic ---
  function displaySlide(index) {
    const slide = currentImages[index];
    if (!slide) return;

    // Fade out
    imgElement.style.opacity = 0.5;

    setTimeout(() => {
      imgElement.src = slide.path;
      titleElement.textContent = slide.title || '';
      descElement.textContent = slide.description || '';

      // Fade in
      imgElement.style.opacity = 1;
    }, 150);
  }

  // --- 4. Navigation Buttons ---
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % currentImages.length;
      displaySlide(currentIndex);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      displaySlide(currentIndex);
    });
  }

  // --- 5. Auto-load First Gallery ---
  const firstLink = document.querySelector('.link-3');
  if (firstLink) {
    firstLink.click();
  }
});
