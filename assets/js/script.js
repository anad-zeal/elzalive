document.addEventListener('DOMContentLoaded', () => {
  // Configuration
  const links = document.querySelectorAll('.link-3');
  const wrapper = document.getElementById('slideshow-wrapper');
  const galleryTitle = document.getElementById('gallery-title');

  // Slideshow Elements
  const imgElement = document.getElementById('current-image');
  const titleElement = document.getElementById('slide-title');
  const descElement = document.getElementById('slide-desc');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');

  // State
  let currentImages = [];
  let currentIndex = 0;

  // 1. Add Click Listeners to Menu Links
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // Stop page reload

      // Remove active class from all links, add to clicked
      links.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');

      const folderName = link.getAttribute('data_page');
      const friendlyName = link.textContent;

      loadImages(folderName, friendlyName);
    });
  });

  // 2. Function to Fetch Images
  function loadImages(folder, name) {
    // Show loading state (optional)
    galleryTitle.textContent = `Loading ${name}...`;
    wrapper.style.display = 'none';

    fetch(`get_images.php?folder=${folder}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          galleryTitle.textContent = data.error;
          return;
        }

        if (data.length === 0) {
          galleryTitle.textContent = `No images found in ${name}.`;
          return;
        }

        // Success
        currentImages = data;
        currentIndex = 0; // Reset to first image

        galleryTitle.textContent = name;
        wrapper.style.display = 'flex'; // Show slideshow

        displaySlide(currentIndex);
      })
      .catch((err) => {
        console.error('Error:', err);
        galleryTitle.textContent = 'An error occurred loading the gallery.';
      });
  }

  // 3. Function to Display specific slide
  function displaySlide(index) {
    const slide = currentImages[index];

    // Fade effect (simple)
    imgElement.style.opacity = 0;

    setTimeout(() => {
      imgElement.src = slide.path;
      titleElement.textContent = slide.title;
      descElement.textContent = slide.description;
      imgElement.style.opacity = 1;
    }, 200);
  }

  // 4. Navigation Logic
  nextBtn.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex >= currentImages.length) {
      currentIndex = 0; // Loop back to start
    }
    displaySlide(currentIndex);
  });

  prevBtn.addEventListener('click', () => {
    currentIndex--;
    if (currentIndex < 0) {
      currentIndex = currentImages.length - 1; // Loop to end
    }
    displaySlide(currentIndex);
  });

  // Optional: Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (wrapper.style.display === 'flex') {
      if (e.key === 'ArrowRight') nextBtn.click();
      if (e.key === 'ArrowLeft') prevBtn.click();
    }
  });
});
