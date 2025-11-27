// EXAMPLE LOGIC FOR YOUR SCRIPT.JS

// 1. Fetch the specific JSON file (e.g., encaustic-slideshow.json)
fetch('json-files/encaustic-slideshow.json')
  .then((response) => response.json())
  .then((data) => {
    // 2. Generate HTML String from JSON data
    const html = generateSlideshowHTML(data);

    // 3. Inject into the DOM
    document.getElementById('dynamic-content-area').innerHTML = html;

    // 4. Initialize the Slideshow Logic
    window.SlideshowManager.init();
  });
