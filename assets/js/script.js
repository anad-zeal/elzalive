document.addEventListener('DOMContentLoaded', () => {
  // --- 1. DOM Element References ---
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  const dynamicContentArea = document.getElementById('dynamic-content-area');
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');
  const pageTitleElement = document.querySelector('.hero .page-title');

  // --- 2. Helper Functions ---
  function loadScript(path) {
    if (document.querySelector(`script[src="${path}"]`)) return;
    const script = document.createElement('script');
    script.src = path;
    script.defer = true;
    script.setAttribute('data-dynamic-script', 'true');
    document.body.appendChild(script);
  }

  function cleanupDynamicScripts() {
    const dynamicScripts = document.querySelectorAll('[data-dynamic-script="true"]');
    dynamicScripts.forEach((script) => script.remove());
  }

  // --- 3. HTML Rendering Functions ---
  function renderCardGrid(cardGrid) {
    /* ... same as before ... */
  }
  function renderContentSection(sectionData) {
    /* ... same as before ... */
  }
  function renderContactForm(formData) {
    /* ... same as before ... */
  }

  function renderSlideshow(template) {
    const wrapper = document.createElement(template.wrapper.tag);
    wrapper.className = template.wrapper.class;
    const slideContainer = document.createElement('div');
    slideContainer.className = template.slideContainerClass;
    slideContainer.setAttribute('data-gallery-source', template.gallerySource);
    const createNavButton = (btnData) => {
      const div = document.createElement('div');
      div.className = btnData.wrapperClass;
      const button = document.createElement('button');
      button.id = btnData.buttonId;
      button.className = 'prev-next circle';
      const img = document.createElement('img');
      img.src = btnData.imgSrc;
      img.alt = btnData.imgAlt;
      img.className = 'prev-nexts';
      img.width = 50;
      button.appendChild(img);
      div.appendChild(button);
      return div;
    };
    const prevButton = createNavButton(template.previousButton);
    const nextButton = createNavButton(template.nextButton);
    const captionWrapper = document.createElement('div');
    captionWrapper.className = template.caption.wrapperClass;
    const captionText = document.createElement('p');
    captionText.id = template.caption.paragraphId;
    captionWrapper.appendChild(captionText);
    const descriptionWrapper = document.createElement('div');
    descriptionWrapper.className = template.description.wrapperClass;
    const descriptionText = document.createElement('p');
    descriptionText.id = template.description.paragraphId;
    descriptionWrapper.appendChild(descriptionText);

    // Assemble all parts (NO FOOTER)
    wrapper.appendChild(slideContainer);
    wrapper.appendChild(prevButton);
    wrapper.appendChild(nextButton);
    wrapper.appendChild(captionWrapper);
    wrapper.appendChild(descriptionWrapper);

    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(wrapper);

    if (template.scriptToLoad) {
      loadScript(template.scriptToLoad);
    }
  }

  // --- 4. Main Page Content Controller ---
  function renderPageContent(data, pageName) {
    /* ... same as before ... */
  }

  // --- 5. Core Navigation and Data Loading Logic ---
  async function loadJsonContent(pageName, addToHistory = true) {
    /* ... same as before ... */
  }

  // --- 6. Event Listeners and Initial Load ---
  navLinks.forEach((link) => {
    /* ... same as before ... */
  });
  window.addEventListener('popstate', (event) => {
    /* ... same as before ... */
  });
  const initialPage = window.location.pathname.substring(1) || 'home';
  loadJsonContent(initialPage, false).then(() => {
    /* ... same as before ... */
  });
});
