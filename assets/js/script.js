/**
 * assets/js/script.js
 * Main Router and Page Renderer
 */
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  // Selects links inside the new hamburger menu structure
  const navLinks = document.querySelectorAll('.main-nav-menu a');
  const dynamicContentArea = document.getElementById('dynamic-content-area');

  // Menu DOM Elements
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeNavBtn = document.getElementById('close-nav-btn');
  const navMenu = document.getElementById('main-nav');
  const navBackdrop = document.getElementById('nav-backdrop');

  let siteData = null;

  // --- Script Loader ---
  function loadScript(path, callback) {
    const existingScript = document.querySelector(`script[src="${path}"]`);
    if (existingScript) {
      if (callback) callback();
      return;
    }

    const script = document.createElement('script');
    script.src = path;
    script.defer = true;
    script.setAttribute('data-dynamic-script', 'true');

    script.onload = () => {
      if (callback) callback();
    };

    script.onerror = () => {
      console.error('Failed to load script:', path);
    };

    document.body.appendChild(script);
  }

  // --- Rendering Functions ---

  function renderCardGrid(cardGrid) {
    const sectionWrapper = document.createElement('section');
    sectionWrapper.className = 'card-grid';

    cardGrid.forEach((item) => {
      const card = document.createElement('div');
      card.className = item.type; // "card"
      const content = item.content;

      const cardContent = document.createElement('div');
      cardContent.className = content.type; // "landingMenuItem"
      if (content.class) cardContent.classList.add(...content.class.split(' '));

      // Link handling
      if (content.link) {
        const linkElement = document.createElement('a');
        linkElement.href = content.link.href;
        linkElement.textContent = content.link.text;

        // Add classes
        if (content.link.class) {
          linkElement.className = content.link.class;
        } else {
          linkElement.className = 'page-link';
        }

        // Get page ID for router (remove slashes)
        const pageName = content.link.href.replace(/^\//, '').trim();

        if (pageName) linkElement.setAttribute('data-page', pageName);
        if (content.link.ariaLabel) linkElement.setAttribute('aria-label', content.link.ariaLabel);

        cardContent.appendChild(linkElement);
      }

      // Paragraph handling
      if (content.paragraph) {
        if (typeof content.paragraph === 'object' && content.paragraph.type === 'image') {
          const img = document.createElement('img');
          img.src = content.paragraph.src;
          if (content.paragraph.class) img.className = content.paragraph.class;
          img.alt = content.paragraph.alt || '';
          cardContent.appendChild(img);
        } else {
          const p = document.createElement('p');
          p.textContent = content.paragraph;
          cardContent.appendChild(p);
        }
      }

      card.appendChild(cardContent);
      sectionWrapper.appendChild(card);
    });

    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(sectionWrapper);
  }

  function renderContentSection(sectionData) {
    const wrapperElement = document.createElement(sectionData.tag);
    for (const key in sectionData.attributes) {
      wrapperElement.setAttribute(key, sectionData.attributes[key]);
    }

    sectionData.paragraphs.forEach((pText) => {
      const p = document.createElement('p');
      p.textContent = pText;
      wrapperElement.appendChild(p);
    });

    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(wrapperElement);
  }

  function renderContactForm(formData) {
    const sectionWrapper = document.createElement(formData.wrapper.tag);
    if (formData.wrapper.attributes && formData.wrapper.attributes.class) {
      sectionWrapper.className = formData.wrapper.attributes.class;
    }

    let formHtml = `<form class="${formData.form.attributes.class || 'ccform'}">`;
    if (formData.fields) {
      formData.fields.forEach((field) => {
        if (field.type === 'submit') {
          formHtml += `<button type="submit">${field.value}</button>`;
        } else if (field.type === 'textarea') {
          formHtml += `<textarea placeholder="${field.placeholder}" rows="${field.rows}"></textarea>`;
        } else {
          formHtml += `<input type="${field.type}" placeholder="${field.placeholder}" ${
            field.required ? 'required' : ''
          }>`;
        }
      });
    }
    formHtml += `</form>`;

    sectionWrapper.innerHTML = `<h3>${formData.title || 'Contact'}</h3>` + formHtml;

    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(sectionWrapper);
  }

  function renderSlideshow(template, pageTitle) {
    const wrapper = document.createElement(template.wrapper.tag);
    wrapper.className = template.wrapper.class;

    wrapper.innerHTML = `
        <div class="logo"><p>The Life of an Artist</p></div>
        <div class="category"><p>${pageTitle}</p></div>

        <div class="${template.previousButton.wrapperClass}">
          <button id="${template.previousButton.buttonId}" aria-label="${template.previousButton.ariaLabel}">
            <img src="${template.previousButton.imgSrc}" alt="${template.previousButton.imgAlt}">
          </button>
        </div>

        <div class="${template.slideContainerClass}" data-gallery-source="${template.gallerySource}">
             <div class="loading-msg">Loading Gallery...</div>
        </div>

        <div class="${template.nextButton.wrapperClass}">
          <button id="${template.nextButton.buttonId}" aria-label="${template.nextButton.ariaLabel}">
            <img src="${template.nextButton.imgSrc}" alt="${template.nextButton.imgAlt}">
          </button>
        </div>

        <div class="${template.rtnArrow.wrapperClass}">
          <a href="/" data-page="home" aria-label="${template.rtnArrow.ariaLabel}">
            <img src="${template.rtnArrow.imgSrc}" alt="${template.rtnArrow.imgAlt}">
          </a>
        </div>

        <div class="description">
          <p id="${template.caption.paragraphId}"></p>
          <p id="${template.description.paragraphId}"></p>
        </div>
      `;

    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(wrapper);

    // Load and Initialize Logic
    if (template.scriptToLoad) {
      loadScript(template.scriptToLoad, () => {
        if (typeof initSlideshow === 'function') {
          initSlideshow();
        }
      });
    }
  }

  // --- Page Controller ---
  function renderPageContent(data) {
    document.title = `${data.title} | AEPaints`;

    // Manage Body Classes for CSS
    if (data.slideshowTemplate) {
      body.classList.add('slideshow-active');
    } else {
      body.classList.remove('slideshow-active');
    }

    // Render Logic
    if (data.cardGrid) {
      renderCardGrid(data.cardGrid);
    } else if (data.contentSection) {
      renderContentSection(data.contentSection);
    } else if (data.contactForm) {
      renderContactForm(data.contactForm);
    } else if (data.slideshowTemplate) {
      renderSlideshow(data.slideshowTemplate, data.title);
    } else {
      dynamicContentArea.innerHTML = `<p>No content available.</p>`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function loadPage(pageName, addToHistory = true) {
    if (!siteData) return;

    if (!pageName || pageName === '/') pageName = 'home';

    const pageData = siteData.pages[pageName];

    if (!pageData) {
      console.error('Page not found:', pageName);
      return;
    }

    let finalData = { title: pageData.title };

    // Prepare data object based on type
    if (pageData.type === 'slideshow') {
      const templateCopy = JSON.parse(JSON.stringify(siteData.slideshowTemplate));
      templateCopy.gallerySource = pageData.gallerySource;
      finalData.slideshowTemplate = templateCopy;
    } else if (pageData.type === 'cardGrid') {
      finalData.cardGrid = pageData.content;
    } else if (pageData.type === 'contentSection') {
      finalData.contentSection = pageData.content;
    } else if (pageData.type === 'contactForm') {
      finalData.contactForm = pageData.content;
    }

    renderPageContent(finalData);

    // Update Menu State
    navLinks.forEach((link) => link.classList.remove('is-active'));
    const activeLink = document.querySelector(`.main-nav-menu a[data-page="${pageName}"]`);
    if (activeLink) activeLink.classList.add('is-active');

    if (addToHistory) {
      history.pushState(
        { page: pageName },
        finalData.title,
        `/${pageName === 'home' ? '' : pageName}`
      );
    }
  }

  // --- Menu Toggle Logic ---
  function toggleMenu(show) {
    if (show) {
      navMenu.classList.add('is-open');
      hamburgerBtn.classList.add('is-hidden');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
    } else {
      navMenu.classList.remove('is-open');
      hamburgerBtn.classList.remove('is-hidden');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => toggleMenu(true));
  }

  if (closeNavBtn) {
    closeNavBtn.addEventListener('click', () => toggleMenu(false));
  }

  if (navBackdrop) {
    navBackdrop.addEventListener('click', () => toggleMenu(false));
  }

  // --- Init ---
  async function init() {
    try {
      const response = await fetch('json-files/site-data.json');
      if (!response.ok) throw new Error('Failed to load site data.');
      siteData = await response.json();

      const path = window.location.pathname.replace(/^\//, ''); // Remove leading slash
      const initialPage = path || 'home';
      loadPage(initialPage, false);
    } catch (error) {
      console.error('Fatal Error:', error);
    }
  }

  // --- Global Event Listeners ---

  // 1. Handle Link Clicks (SPA Router + Menu Close)
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-page]');
    if (link) {
      event.preventDefault();

      // CLOSE MENU if it's open (Logic from previous step integrated here)
      toggleMenu(false);

      loadPage(link.dataset.page);
    }
  });

  // 2. Handle Browser Back/Forward Buttons
  window.addEventListener('popstate', (event) => {
    const statePage = event.state ? event.state.page : 'home';
    loadPage(statePage, false);
  });

  // Start the app
  init();
});
