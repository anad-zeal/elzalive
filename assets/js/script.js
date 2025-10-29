document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu');
  const dynamicContentArea = document.getElementById('dynamic-content-area');
  const dynamicPageWrapper = document.getElementById('dynamic-page-wrapper');
  const pageTitleElement = document.querySelector('.hero .page-title');

  /**
   * Renders a grid of cards from a JSON object into the dynamic content area.
   * This version now correctly creates the <section class="card-grid"> wrapper.
   * @param {Array} cardGrid - An array of card objects from the JSON file.
   */
  function renderCardGrid(cardGrid) {
    // *** NEW: Create the main section wrapper element ***
    const sectionWrapper = document.createElement('section');
    sectionWrapper.className = 'card-grid';

    cardGrid.forEach((item) => {
      // Create the main container for the card
      const card = document.createElement('div');
      card.className = item.type; // e.g., "card"

      const content = item.content;
      const cardContent = document.createElement('div');
      cardContent.className = content.type; // e.g., "landingMenuItem"
      if (content.class) {
        cardContent.classList.add(...content.class.split(' '));
      }

      // If there's a link object, create the link element
      if (content.link) {
        const link = content.link;
        const linkElement = document.createElement('a');
        linkElement.href = link.href;
        linkElement.textContent = link.text;
        linkElement.className = link.class;
        linkElement.setAttribute('data-gallery', link.dataGallery);
        linkElement.setAttribute('aria-label', link.ariaLabel);
        cardContent.appendChild(linkElement);
      }

      // If there's a paragraph, handle it
      if (content.paragraph) {
        if (typeof content.paragraph === 'object' && content.paragraph.type === 'image') {
          const img = document.createElement('img');
          img.src = content.paragraph.src;
          img.className = content.paragraph.class;
          img.alt = '';
          cardContent.appendChild(img);
        } else {
          const p = document.createElement('p');
          p.textContent = content.paragraph;
          cardContent.appendChild(p);
        }
      }

      card.appendChild(cardContent);
      // *** MODIFIED: Append the card to the section wrapper, not a fragment ***
      sectionWrapper.appendChild(card);
    });

    // Clear any previous content
    dynamicContentArea.innerHTML = '';
    // *** MODIFIED: Append the single, complete section wrapper to the DOM ***
    dynamicContentArea.appendChild(sectionWrapper);
  }

  function renderPageContent(data, pageName) {
    const title = data.title || pageName.charAt(0).toUpperCase() + pageName.slice(1);
    document.title = `${title} | AEPaints`;
    if (pageTitleElement) {
      pageTitleElement.textContent = title;
    }

    // *** ADD THIS 'ELSE IF' BLOCK FOR THE FORM ***
    if (data.cardGrid) {
      renderCardGrid(data.cardGrid);
    } else if (data.contentSection) {
      renderContentSection(data.contentSection);
    } else if (data.contactForm) {
      // CHECK FOR THE NEW STRUCTURE
      renderContactForm(data.contactForm); // CALL THE NEW FUNCTION
    } else if (data.contentHtml) {
      dynamicContentArea.innerHTML = data.contentHtml;
    } else {
      dynamicContentArea.innerHTML = `<p>No content available for "${title}".</p>`;
    }

    dynamicContentArea.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Renders a content section with paragraphs from a JSON object.
   * @param {object} sectionData - The contentSection object from the JSON file.
   */
  function renderContentSection(sectionData) {
    // 1. Create the main wrapper element (e.g., <section>)
    const wrapperElement = document.createElement(sectionData.tag);

    // 2. Set all attributes from the JSON onto the wrapper element
    for (const key in sectionData.attributes) {
      wrapperElement.setAttribute(key, sectionData.attributes[key]);
    }

    // 3. Create and append each paragraph
    sectionData.paragraphs.forEach((pText) => {
      const p = document.createElement('p');
      p.textContent = pText; // Use textContent for security
      wrapperElement.appendChild(p);
    });

    // 4. Clear the old content and append the new, fully-built element
    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(wrapperElement);
  }

  async function loadJsonContent(pageName, addToHistory = true) {
    const jsonFileName = `${pageName}.json`;
    const url = `/json-files/${jsonFileName}`;

    dynamicContentArea.innerHTML = '<p>Loading content...</p>';
    if (pageTitleElement) {
      pageTitleElement.textContent = '';
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ${url}`);
      }
      const data = await response.json();

      renderPageContent(data, pageName);

      navLinks.forEach((link) => {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      });
      const activeLink = document.querySelector(`.main-nav-menu a[data-page="${pageName}"]`);
      if (activeLink) {
        activeLink.classList.add('is-active');
        activeLink.setAttribute('aria-current', 'page');
      }

      if (dynamicPageWrapper) {
        dynamicPageWrapper.dataset.page = pageName;
      }

      if (addToHistory) {
        const title = data.title || pageName;
        history.pushState({ page: pageName, title: title }, title, `/${pageName}`);
      }
    } catch (error) {
      console.error(`Error loading JSON file for ${pageName}:`, error);
      dynamicContentArea.innerHTML = `<p>Error loading content for "${pageName}". Please try again.</p>`;
      document.title = `Error | AEPaints`;
      if (pageTitleElement) {
        pageTitleElement.textContent = `Error Loading Page`;
      }
    }
  }

  /**
   * Renders a contact form from a JSON object.
   * @param {object} formData - The contactForm object from the JSON file.
   */
  function renderContactForm(formData) {
    // 1. Create the main <section> wrapper
    const sectionWrapper = document.createElement(formData.wrapper.tag);
    for (const key in formData.wrapper.attributes) {
      sectionWrapper.setAttribute(key, formData.wrapper.attributes[key]);
    }

    // 2. Create the form container and the <form> element
    const formWrapper = document.createElement('div');
    formWrapper.className = 'contact-form-wrapper';

    const formElement = document.createElement('form');
    for (const key in formData.form.attributes) {
      formElement.setAttribute(key, formData.form.attributes[key]);
    }

    // 3. Loop through the fields array to build each input
    formData.fields.forEach((field) => {
      const fieldContainer = document.createElement('div');
      fieldContainer.className = 'ccfield-prepend';

      // Handle the submit button differently since it has no icon/span
      if (field.type === 'submit') {
        const submitInput = document.createElement('input');
        submitInput.className = 'ccbtn';
        submitInput.type = 'submit';
        submitInput.value = field.value;
        fieldContainer.appendChild(submitInput);
      } else {
        // Build the standard field with icon and input/textarea
        const addon = document.createElement('span');
        addon.className = 'ccform-addon';
        const icon = document.createElement('i');
        icon.className = `fa ${field.icon} fa-2x`;
        addon.appendChild(icon);

        let inputElement;
        if (field.type === 'textarea') {
          inputElement = document.createElement('textarea');
          inputElement.name = field.name;
          inputElement.rows = field.rows;
        } else {
          inputElement = document.createElement('input');
          inputElement.type = field.type;
        }

        inputElement.className = 'ccformfield';
        inputElement.placeholder = field.placeholder;
        if (field.required) {
          inputElement.required = true;
        }

        fieldContainer.appendChild(addon);
        fieldContainer.appendChild(inputElement);
      }
      formElement.appendChild(fieldContainer);
    });

    // 4. Assemble the final structure
    formWrapper.appendChild(formElement);
    sectionWrapper.appendChild(formWrapper);

    // 5. Clear old content and render the new form
    dynamicContentArea.innerHTML = '';
    dynamicContentArea.appendChild(sectionWrapper);
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const pageName = event.target.dataset.page;
      if (pageName) {
        loadJsonContent(pageName);
      }
    });
  });

  window.addEventListener('popstate', (event) => {
    const statePage = event.state
      ? event.state.page
      : window.location.pathname.substring(1) || 'home';
    if (statePage) {
      loadJsonContent(statePage, false);
    }
  });

  const initialPath = window.location.pathname.substring(1);
  const initialPage = initialPath || 'home';

  loadJsonContent(initialPage, false).then(() => {
    const currentTitle = document.title;
    history.replaceState(
      { page: initialPage, title: currentTitle },
      currentTitle,
      `/${initialPage}`
    );

    const activeLink = document.querySelector(`.main-nav-menu a[data-page="${initialPage}"]`);
    if (activeLink) {
      activeLink.classList.add('is-active');
      activeLink.setAttribute('aria-current', 'page');
    }

    if (dynamicPageWrapper) {
      dynamicPageWrapper.dataset.page = initialPage;
    }
  });
});
