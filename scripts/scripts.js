import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    // Check if h1 or picture is already inside a hero block
    if (h1.closest('.hero') || picture.closest('.hero')) {
      return; // Don't create a duplicate hero block
    }
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }

    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateColumnsFormSection(main); // <-- custom logic for columns-form
  decorateColumnsAccordionSection(main); // <-- custom logic for columns-accordion
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

function decorateColumnsAccordionSection(main) {
  const section = main.querySelector('.section.columns-accordion');
  if (section) {
    const columnsWrapper = section.querySelector('.columns-wrapper');
    const accordionWrapper = section.querySelector('.accordion-wrapper');
    const textContent = columnsWrapper.children[0].children[0].children[0];
    const h2Tag = textContent.children[1];
    console.log(h2Tag);
    if (h2Tag) {
        if (accordionWrapper.parentNode !== textContent) {
          accordionWrapper.parentNode.removeChild(accordionWrapper);
        }
        h2Tag.insertAdjacentElement('afterend', accordionWrapper);
      }
  }
}

function decorateColumnsFormSection(main) {
  const section = main.querySelector('.section.column-form');
  if (section) {
    const columnsWrapper = section.querySelector('.columns-wrapper');
    const formWrapper = section.querySelector('.custom-form-wrapper');
    const textContent = columnsWrapper.children[0].children[0].children[0];
    const h2Tag = textContent.children[1];
    console.log(h2Tag);
    if (h2Tag) {
      if (formWrapper.parentNode !== textContent) {
        formWrapper.parentNode.removeChild(formWrapper);
      }
      h2Tag.insertAdjacentElement('afterend', formWrapper);
    }

    // --- Play button overlay and modal logic for image ---
    const img = section.querySelector('img');
    if (img && !img.closest('.video-play-wrapper')) {
      // Create a wrapper for positioning
      const wrapper = document.createElement('div');
      wrapper.className = 'video-play-wrapper';
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      // Create play button overlay with wave animation
      const playBtn = document.createElement('div');
      playBtn.className = 'custom-play-btn';
      playBtn.innerHTML = `
        <span class="waves">
          <span class="wave"></span>
          <span class="wave"></span>
          <span class="wave"></span>
        </span>
        <span class="play-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#fff"/>
            <polygon points="20,16 36,24 20,32" fill="#000"/>
          </svg>
        </span>
      `;
      playBtn.style.position = 'absolute';
      playBtn.style.top = '50%';
      playBtn.style.left = '50%';
      playBtn.style.transform = 'translate(-50%, -50%)';
      playBtn.style.cursor = 'pointer';
      playBtn.style.zIndex = '2';
      playBtn.title = 'Play Video';
      wrapper.appendChild(playBtn);
      // Inject animation CSS if not already present
      if (!document.getElementById('custom-play-btn-css')) {
        const style = document.createElement('style');
        style.id = 'custom-play-btn-css';
        style.textContent = `
          .custom-play-btn {
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: transparent;
            box-shadow: none;
          }
          .custom-play-btn .play-icon {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;
          }
          .custom-play-btn .waves {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
            width: 80px;
            height: 80px;
            pointer-events: none;
          }
          .custom-play-btn .wave {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(255,255,255,0.5);
            transform: translate(-50%, -50%) scale(1);
            animation: wave-anim 1.8s infinite linear;
            opacity: 0.7;
          }
          .custom-play-btn .wave:nth-child(2) {
            animation-delay: 0.6s;
          }
          .custom-play-btn .wave:nth-child(3) {
            animation-delay: 1.2s;
          }
          @keyframes wave-anim {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.7;
            }
            70% {
              opacity: 0.2;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.8);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
      // Modal logic
      playBtn.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.85)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.style.flexDirection = 'column';
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '32px';
        closeBtn.style.right = '48px';
        closeBtn.style.fontSize = '48px';
        closeBtn.style.color = '#fff';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.zIndex = '10000';
        closeBtn.title = 'Close';
        modal.appendChild(closeBtn);
        const iframe = document.createElement('iframe');
        iframe.width = Math.min(window.innerWidth * 0.9, 900);
        iframe.height = Math.min(window.innerHeight * 0.8, 506);
        iframe.src = 'https://www.youtube.com/embed/IgM0smVoPHs?autoplay=1';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; fullscreen';
        iframe.allowFullscreen = true;
        iframe.style.background = '#000';
        iframe.style.borderRadius = '8px';
        modal.appendChild(iframe);
        closeBtn.onclick = () => document.body.removeChild(modal);
        modal.onclick = (e) => {
          if (e.target === modal) document.body.removeChild(modal);
        };
        document.body.appendChild(modal);
      });
    }
    // --- End video modal logic ---
  }
}
