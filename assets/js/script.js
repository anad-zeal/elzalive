document.addEventListener('DOMContentLoaded', function () {
  // --- ELEMENT SELECTORS ---
  const slideshowContainer = document.getElementById('slideshow-container');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');

  // --- STATE VARIABLES ---
  let slides = [];
  let currentSlideIndex = 0;
  let slideshowInterval;

  // --- MAIN FUNCTION to build the slideshow ---
  async function populateSlideshow() {
    try {
      const response = await fetch('get_images.php');
      if (!response.ok) throw new Error(`Network response error: ${response.statusText}`);

      const images = await response.json();
      if (images.length === 0) {
        slideshowContainer.innerHTML = '<p>No images found.</p>';
        return;
      }

      slideshowContainer.innerHTML = ''; // Clear loading message

      images.forEach((image) => {
        // (The slide creation code is the same as before)
        const slideElement = document.createElement('div');
        slideElement.className = 'slide';
        const imageElement = document.createElement('img');
        imageElement.src = image.path;
        imageElement.alt = image.title;
        const textContainer = document.createElement('div');
        textContainer.className = 'slide-text';
        textContainer.innerHTML = `<h3>${image.title}</h3><p>${image.description}</p><small>Dimensions: ${image.width}px x ${image.height}px</small>`;
        slideElement.appendChild(imageElement);
        slideElement.appendChild(textContainer);
        slideshowContainer.appendChild(slideElement);
      });

      // Re-add the navigation buttons into the now-cleared container
      slideshowContainer.appendChild(prevButton);
      slideshowContainer.appendChild(nextButton);

      startSlideshow();
    } catch (error) {
      console.error('Slideshow population error:', error);
      slideshowContainer.innerHTML = '<p>Error loading images.</p>';
    }
  }

  // --- NAVIGATION FUNCTIONS ---
  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove('active'));
    slides[index].classList.add('active');
  }

  function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(currentSlideIndex);
  }

  function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    showSlide(currentSlideIndex);
  }

  // Resets the automatic timer. Called whenever the user clicks a button.
  function resetInterval() {
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(nextSlide, 4000);
  }

  // --- INITIALIZATION FUNCTION ---
  function startSlideshow() {
    slides = document.querySelectorAll('#slideshow-container .slide');
    if (slides.length <= 1) {
      // If only one slide, hide the buttons
      prevButton.style.display = 'none';
      nextButton.style.display = 'none';
      if (slides.length === 1) showSlide(0); // Show the single slide
      return;
    }

    currentSlideIndex = 0;
    showSlide(currentSlideIndex);

    // Start the timer
    slideshowInterval = setInterval(nextSlide, 4000);

    // --- ADD EVENT LISTENERS FOR BUTTONS ---
    prevButton.addEventListener('click', () => {
      prevSlide();
      resetInterval(); // Reset timer on click
    });

    nextButton.addEventListener('click', () => {
      nextSlide();
      resetInterval(); // Reset timer on click
    });
  }

  // --- START THE PROCESS ---
  populateSlideshow();
});
