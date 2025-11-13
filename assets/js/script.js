document.addEventListener('DOMContentLoaded', function () {
  alert('Script loaded successfully!');
  const slideshowContainer = document.getElementById('slideshow-container'); // Make sure you have this ID in your HTML

  // Function to fetch image data and build the slideshow
  async function populateSlideshow() {
    try {
      // Fetch the image data from our PHP script
      const response = await fetch('get_images.php');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const images = await response.json();

      // Clear any existing content in the slideshow container
      slideshowContainer.innerHTML = '';

      // Loop through each image object and create the HTML for it
      images.forEach((image) => {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide'; // Use your slideshow's class for a slide

        const imageElement = document.createElement('img');
        imageElement.src = image.path;
        imageElement.alt = image.title;

        const titleElement = document.createElement('h3');
        titleElement.textContent = image.title;

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = image.description;

        const dimensionsElement = document.createElement('small');
        dimensionsElement.textContent = `Dimensions: ${image.width}px x ${image.height}px`;

        // Append the new elements to the slide
        slideElement.appendChild(imageElement);
        slideElement.appendChild(titleElement);
        slideElement.appendChild(descriptionElement);
        slideElement.appendChild(dimensionsElement);

        // Add the completed slide to the slideshow container
        slideshowContainer.appendChild(slideElement);
      });

      // After populating, you would typically initialize your slideshow logic here
      // For example: startSlideshow();
    } catch (error) {
      console.error('There was a problem fetching the image data:', error);
      slideshowContainer.innerHTML = '<p>Error loading images. Please try again later.</p>';
    }
  }

  // Call the function to start the process
  populateSlideshow();
});
