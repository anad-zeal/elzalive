document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------
  // ELEMENT SELECTORS-S-S-
  // -------------------------------------------------
  const slideshowContainer = document.getElementById('slideshow-container');
  const folderSelector = document.getElementById('folder-selector');

  // -------------------------------------------------
  // STATE
  // -------------------------------------------------
  let slides = [];
  let currentSlideIndex = 0;
  let slideshowInterval = null;

  // -------------------------------------------------
  // Build slideshow for a specific folder
  // -------------------------------------------------
  async function populateSlideshow(folderName) {
    clearInterval(slideshowInterval);

    // Initial loader UI
    // slideshowContainer.innerHTML = `
    //       <p>Loading ${folderName.replace(/-/g, ' ')}...</p>
    //       <button id="prev-button" class="slide-nav">
    //         <img src="images/misc-images/prev.png" alt="Previous" />
    //       </button>
    //       <button id="next-button" class="slide-nav">
    //         <img src="images/misc-images/next.png" alt="Next" />
    //       </button>
    //     `;

    try {
      const response = await fetch(`get_images.php?folder=${folderName}`);

      if (!response.ok) {
        // *** FIX: Also used backticks here for the error message. ***
        throw new Error(`Network response error: ${response.statusText}`);
      }

      const images = await response.json();

      // Remove loader
      const loader = slideshowContainer.querySelector('p');
      if (loader) loader.remove();

      if (images.length === 0) {
        // Clear the buttons if no images are found
        slideshowContainer.innerHTML = '<p>No images found in this gallery.</p>';
        return;
      }

      // Build slides
      images.forEach((img) => {
        const slide = document.createElement('div');
        slide.className = 'slide';

        slide.innerHTML = `
          <img src="${img.path}" alt="${img.title}">
          <div class="slide-text">
            <h3>${img.title}</h3>
            <p>${img.description || ''}</p>
            <small>Dimensions: ${img.width}px &times; ${img.height}px</small>
          </div>
        `;

        slideshowContainer.prepend(slide);
      });

      startSlideshowRunner();
    } catch (err) {
      console.error('Error building slideshow:', err);
      slideshowContainer.innerHTML = '<p>Error loading images. Check console.</p>';
    }
  }

  // -------------------------------------------------
  // Initialize slideshow logic
  // -------------------------------------------------
  function startSlideshowRunner() {
    slides = [...document.querySelectorAll('#slideshow-container .slide')];
    currentSlideIndex = 0;

    // Get references to the buttons that were just created by populateSlideshow
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    if (slides.length <= 1) {
      if (slides.length === 1) showSlide(0);
      prevButton.style.display = 'none';
      nextButton.style.display = 'none';
      return;
    }

    prevButton.style.display = 'block';
    nextButton.style.display = 'block';

    // Since the buttons are new every time, we can just add new listeners.
    // The old ones were destroyed when we changed innerHTML.
    prevButton.addEventListener('click', () => {
      prevSlide();
      resetInterval();
    });

    nextButton.addEventListener('click', () => {
      nextSlide();
      resetInterval();
    });

    showSlide(0);
    slideshowInterval = setInterval(nextSlide, 4000);
  }

  // -------------------------------------------------
  // SLIDESHOW HELPERS
  // -------------------------------------------------
  function showSlide(index) {
    slides.forEach((s, i) => {
      if (i === index) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  }

  function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(currentSlideIndex);
  }

  function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    showSlide(currentSlideIndex);
  }

  function resetInterval() {
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(nextSlide, 4000);
  }

  // -------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------
  if (folderSelector) {
    folderSelector.addEventListener('change', () => {
      populateSlideshow(folderSelector.data_page);
    });

    // Load the initial gallery based on the dropdown's default selected data-page
    populateSlideshow(folderSelector.data_page);
  } else {
    console.error('Folder selector dropdown not found.');
  }
});
