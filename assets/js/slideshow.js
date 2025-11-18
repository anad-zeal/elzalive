document.addEventListener('DOMContentLoaded', function () {
  // --- ELEMENT SELECTORS ---
  // Get references to the HTML elements we need to work with.
  const slideshowContainer = document.getElementById('slideshow-container');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');

  // --- STATE VARIABLES ---
  // These variables will keep track of the slideshow's current state.
  let slides = []; // This will hold all the slide elements once they are created.
  let currentSlideIndex = 0; // The index of the slide currently being shown.
  let slideshowInterval; // This will hold the timer for the automatic slide changes.

  // --- FUNCTION 1: Fetches data and builds the HTML ---
  async function populateSlideshow() {
    try {
      const response = await fetch('get_images.php');
      if (!response.ok) throw new Error(`Network response error: ${response.statusText}`);

      const images = await response.json();
      if (images.length === 0) {
        slideshowContainer.innerHTML = '<p>No images found in the folder.</p>';
        // Also hide the buttons if there are no images
        prevButton.style.display = 'none';

        nextButton.style.display = 'none';
        return;
      }

      // Temporarily hide the buttons while we rebuild the slides
      prevButton.style.display = 'none';
      nextButton.style.display = 'none';

      slideshowContainer.innerHTML = ''; // Clear the "Loading images..." message

      // Loop through the data and create a slide for each image
      images.forEach((image) => {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide';

        const imageElement = document.createElement('img');
        imageElement.src = image.path;
        imageElement.alt = image.title;

        const textContainer = document.createElement('div');
        textContainer.className = 'slide-text';
        textContainer.innerHTML = `<h3>${image.title}</h3><p>${
          image.description || ''
        }</p><small>Dimensions: ${image.width}px x ${image.height}px</small>`;

        slideElement.appendChild(imageElement);
        slideElement.appendChild(textContainer);
        slideshowContainer.appendChild(slideElement);
      });

      // After creating the slides, start the slideshow logic
      startSlideshow();
    } catch (error) {
      console.error('There was a problem building the slideshow:', error);
      slideshowContainer.innerHTML = '<p>Error loading images. Please try again later.</p>';
    }
  }

  // --- FUNCTION 2: Shows a specific slide by its index ---
  function showSlide(index) {
    // First, remove the 'active' class from all slides to hide them.
    slides.forEach((slide) => slide.classList.remove('active'));
    // Then, add the 'active' class to only the one we want to show.
    slides[index].classList.add('active');
  }

  // --- FUNCTION 3 & 4: Logic for Next and Previous Slides ---
  function nextSlide() {
    // The modulo (%) operator is a clean way to loop back to 0 at the end.
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(currentSlideIndex);
  }

  function prevSlide() {
    // This math correctly handles looping from the first slide (index 0) back to the last.
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    showSlide(currentSlideIndex);
  }

  // --- FUNCTION 5: Resets the automatic timer ---
  function resetInterval() {
    // This is called whenever the user clicks a button to prevent an immediate auto-advance.
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(nextSlide, 4000); // Restart the 4-second timer
  }

  // --- FUNCTION 6: Initializes and starts the slideshow ---
  function startSlideshow() {
    // Get all the .slide elements we just created
    slides = document.querySelectorAll('#slideshow-container .slide');

    // Handle the case where there is 1 or 0 slides
    if (slides.length <= 1) {
      if (slides.length === 1) {
        showSlide(0); // If there's one slide, just show it.
      }
      // Keep the buttons hidden if there aren't multiple slides
      return;
    }

    // Un-hide the buttons now that we know we need them
    prevButton.style.display = 'block';
    nextButton.style.display = 'block';

    // Show the very first slide immediately
    currentSlideIndex = 0;
    showSlide(currentSlideIndex);

    // Start the automatic timer
    slideshowInterval = setInterval(nextSlide, 4000);

    // --- ADD EVENT LISTENERS ---
    // Make the buttons clickable and link them to our functions.
    prevButton.addEventListener('click', () => {
      prevSlide();
      resetInterval();
    });

    nextButton.addEventListener('click', () => {
      nextSlide();
      resetInterval();
    });
  }

  // --- KICK OFF THE ENTIRE PROCESS ---
  populateSlideshow();
});
