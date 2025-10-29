document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  // Target the specific area where dynamic content should be loaded
  const dynamicContentArea = document.getElementById('dynamic-content-area');
  const pageTitleElement = document.querySelector('.hero .page-title'); // Assuming you want to update the <p class="page-title"> in the hero

  /**
   * Renders the fetched JSON data into the dynamic content area.
   * This function will need to be adapted based on the exact structure of your JSON.
   * @param {object} data - The parsed JSON object.
   * @param {string} pageName - The slug of the current page (e.g., 'home', 'artworks').
   */
  function renderPageContent(data, pageName) {
    // Example: Assuming your JSON has a 'title' and 'contentHtml' field
    // Example JSON structure: { "title": "Home Page", "contentHtml": "<p>Welcome to our site!</p>" }

    if (data.title) {
      document.title = `${data.title} | AEPaints`; // Update browser tab title
      if (pageTitleElement) {
        pageTitleElement.textContent = data.title; // Update the hero page title
      }
    } else {
      document.title = `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | AEPaints`; // Fallback
      if (pageTitleElement) {
        pageTitleElement.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1); // Fallback
      }
    }

    if (data.contentHtml) {
      dynamicContentArea.innerHTML = data.contentHtml;
    } else {
      dynamicContentArea.innerHTML = `<p>No content available for "${data.title || pageName}".</p>`;
    }

    // You might want to scroll to the top of the content area after loading
    dynamicContentArea.focus(); // Focus to allow scrolling by keyboard
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Loads and displays JSON content for a given page.
   * @param {string} pageName - The slug of the page to load.
   * @param {boolean} [addToHistory=true] - Whether to add the new state to the browser history.
   */
  async function loadJsonContent(pageName, addToHistory = true) {
    // Construct the filename using the data-page value
    const jsonFileName = `${pageName}.json`;
    const url = `/json-files/${jsonFileName}`;

    // Optional: Show a loading indicator
    dynamicContentArea.innerHTML = '<p>Loading content...</p>';
    if (pageTitleElement) {
      pageTitleElement.textContent = ''; // Clear existing title during load
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${url}`);
      }
      const data = await response.json(); // Parse the JSON data

      // Render the content using the new function
      renderPageContent(data, pageName);

      // Update active state of navigation links
      navLinks.forEach((link) => link.classList.remove('is-active'));
      const activeLink = document.querySelector(`.main-nav-menu a[data-page="${pageName}"]`);
      if (activeLink) {
        activeLink.classList.add('is-active');
        activeLink.setAttribute('aria-current', 'page'); // Ensure ARIA current state is set
      }
      // Remove aria-current from other links
      navLinks.forEach((link) => {
        if (link !== activeLink) {
          link.removeAttribute('aria-current');
        }
      });

      // History API: Update the URL without reloading the page
      if (addToHistory) {
        history.pushState(
          { page: pageName, title: data.title || pageName },
          data.title || pageName,
          `/${pageName}`
        );
      }
    } catch (error) {
      console.error(`Error loading JSON file for ${pageName}:`, error);
      dynamicContentArea.innerHTML = `<p>Error loading content for "${pageName}". Please try again.</p>`;
      // Revert browser title on error, or set to a general error state
      document.title = `Error | AEPaints`;
      if (pageTitleElement) {
        pageTitleElement.textContent = `Error Loading Page`;
      }
    }
  }

  // Add event listeners to navigation links
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent the default link behavior (page reload)
      const pageName = event.target.dataset.page; // Get the page name from data-page attribute
      if (pageName) {
        loadJsonContent(pageName); // Call with addToHistory = true (default)
      }
    });
  });

  // History API: Handle browser back/forward button clicks
  window.addEventListener('popstate', (event) => {
    // event.state will contain the state object pushed by history.pushState
    const statePage = event.state
      ? event.state.page
      : window.location.pathname.substring(1) || 'home';
    if (statePage) {
      loadJsonContent(statePage, false); // Do not add to history when navigating via popstate
    }
  });

  // Handle initial page load based on current URL path or a default
  // This initial load should replace the current history entry, not push a new one
  const initialPath = window.location.pathname.substring(1);
  const initialPage = initialPath || 'home';

  // Call loadJsonContent, and then use replaceState to set the initial URL in history
  // This ensures that if the user hits 'back' immediately, they don't go to an empty state
  loadJsonContent(initialPage, false).then(() => {
    // After initial content is loaded, replace the current history entry
    // This is important for the first page load so 'back' goes to the page *before* this SPA
    // If the initial page is the root, pushState might change / to /home
    const currentTitle = document.title;
    history.replaceState(
      { page: initialPage, title: currentTitle },
      currentTitle,
      `/${initialPage}`
    );

    // Update active class for initial load
    navLinks.forEach((link) => link.classList.remove('is-active'));
    const activeLink = document.querySelector(`.main-nav-menu a[data-page="${initialPage}"]`);
    if (activeLink) {
      activeLink.classList.add('is-active');
      activeLink.setAttribute('aria-current', 'page');
    }
    navLinks.forEach((link) => {
      if (link !== activeLink) {
        link.removeAttribute('aria-current');
      }
    });
  });
});
