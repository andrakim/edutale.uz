/*
  ============================================================
  ОСНОВНАЯ ЛОГИКА САЙТА
  Изображения и переводы подключаются из соседних файлов.
  ============================================================
*/
const SITE_CONFIG = {
  siteName: "edutale.uz",
  projectName: "QALDIRG'OCH",
  defaultLanguage: "ru",
  supportedLanguages: ["ru", "en", "ko"]
};

const ASSETS = {
  heroBackground: "assets/images/image (3).png",
  aboutImage: "assets/images/image (1).png",
  bookImage: "assets/images/image (4).png",
  audioImage: "assets/images/image (5).png",
  videoImage: "assets/images/image (6).png",
  audioComingImage: "assets/images/image (10).png",
  videoComingImage: "assets/images/image (8).png",
  videoDemoImage: "assets/images/image (9).png",
  videoAltImage: "assets/images/image (11).png",
  goalImage: "assets/images/image (7).png",
  galleryOne: "assets/images/image (13).png",
  galleryTwo: "assets/images/уважение_к_старшим.png",
  galleryThree: "assets/images/культура_поведения.png",
  galleryFour: "assets/images/ценность_дружбы.png",
  galleryFive: "assets/images/любовь_к_спорту.png"
};

const TRANSLATIONS = window.QALDIRGOCH_TRANSLATIONS || {};
const STORAGE_KEY = "qaldirgoch-language";

const brandName = document.getElementById("brandName");
const heroTitle = document.getElementById("heroTitle");
const footerProjectName = document.getElementById("footerProjectName");
const metaDescription = document.getElementById("pageDescription");
const yearElement = document.getElementById("year");
const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const languageButtons = document.querySelectorAll(".lang-button");

let activeLanguage = SITE_CONFIG.defaultLanguage;

if (brandName) {
  brandName.textContent = SITE_CONFIG.siteName;
}

if (heroTitle) {
  heroTitle.textContent = SITE_CONFIG.projectName;
}

if (footerProjectName) {
  footerProjectName.textContent = SITE_CONFIG.projectName;
}

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const readTranslation = (language, key) => {
  return key.split(".").reduce((value, segment) => value?.[segment], TRANSLATIONS[language]);
};

const getTranslation = (language, key) => {
  return readTranslation(language, key) ?? readTranslation(SITE_CONFIG.defaultLanguage, key);
};

const normalizeLanguage = (language) => {
  if (!language) {
    return SITE_CONFIG.defaultLanguage;
  }

  const shortCode = language.toLowerCase().split("-")[0];
  return SITE_CONFIG.supportedLanguages.includes(shortCode)
    ? shortCode
    : SITE_CONFIG.defaultLanguage;
};

const setStoredLanguage = (language) => {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch (error) {
    // Ignore storage issues in restricted environments.
  }
};

const getStoredLanguage = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
};

const detectBrowserLanguage = () => {
  const candidates = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language];

  for (const candidate of candidates) {
    const shortCode = candidate?.toLowerCase().split("-")[0];
    if (SITE_CONFIG.supportedLanguages.includes(shortCode)) {
      return shortCode;
    }
  }

  return SITE_CONFIG.defaultLanguage;
};

const applyTranslations = (language) => {
  const nextLanguage = normalizeLanguage(language);
  const translation = TRANSLATIONS[nextLanguage];

  if (!translation) {
    return;
  }

  activeLanguage = nextLanguage;
  document.documentElement.lang = nextLanguage;

  const titleKey = document.body?.dataset.pageTitleKey || "pageTitle";
  const descriptionKey = document.body?.dataset.pageDescriptionKey || "metaDescription";
  const pageTitle = getTranslation(nextLanguage, titleKey);
  const pageDescription = getTranslation(nextLanguage, descriptionKey);

  if (typeof pageTitle === "string") {
    document.title = pageTitle;
  }

  if (metaDescription && typeof pageDescription === "string") {
    metaDescription.setAttribute("content", pageDescription);
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = getTranslation(nextLanguage, element.dataset.i18n);
    if (typeof value === "string") {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const value = getTranslation(nextLanguage, element.dataset.i18nAriaLabel);
    if (typeof value === "string") {
      element.setAttribute("aria-label", value);
    }
  });

  document.querySelectorAll("[data-i18n-caption]").forEach((element) => {
    const value = getTranslation(nextLanguage, element.dataset.i18nCaption);
    if (typeof value === "string") {
      element.setAttribute("data-caption", value);
    }
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === nextLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  setStoredLanguage(nextLanguage);
  syncDemoPanels();
};

const hero = document.querySelector(".hero");
if (hero && ASSETS.heroBackground) {
  hero.style.backgroundImage = `var(--hero-overlay), url("${ASSETS.heroBackground}")`;
}

document.querySelectorAll("[data-asset]").forEach((element) => {
  const key = element.getAttribute("data-asset");
  const path = ASSETS[key];

  if (path) {
    element.style.backgroundImage = `var(--image-overlay), url("${path}")`;
    element.classList.add("has-image");
  } else {
    element.classList.add("is-empty");
  }
});

const setActiveNavigation = () => {
  if (!mainNav) {
    return;
  }

  const currentPage = document.body?.dataset.page || "home";
  mainNav.querySelectorAll("[data-nav-page]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.navPage === currentPage);
  });
};

const setDemoPreviewAsset = (panel, assetKey) => {
  const preview = panel.querySelector("[data-demo-preview]");
  const path = ASSETS[assetKey];

  if (preview && path) {
    preview.style.backgroundImage = `var(--image-overlay), url("${path}")`;
  }
};

const syncDemoPanel = (panel) => {
  const activeOption = panel.querySelector("[data-demo-option].is-active") || panel.querySelector("[data-demo-option]");

  if (!activeOption) {
    return;
  }

  const titleTarget = panel.querySelector("[data-demo-title-output]");
  const metaTarget = panel.querySelector("[data-demo-meta-output]");
  const progress = panel.querySelector("[data-demo-progress]");
  const title = getTranslation(activeLanguage, activeOption.dataset.demoTitleKey);
  const meta = getTranslation(activeLanguage, activeOption.dataset.demoMetaKey);

  if (titleTarget && typeof title === "string") {
    titleTarget.textContent = title;
  }

  if (metaTarget && typeof meta === "string") {
    metaTarget.textContent = meta;
  }

  if (progress) {
    progress.style.width = `${activeOption.dataset.demoProgressValue || 36}%`;
  }

  if (activeOption.dataset.demoAsset) {
    setDemoPreviewAsset(panel, activeOption.dataset.demoAsset);
  }
};

const syncDemoPanels = () => {
  document.querySelectorAll("[data-demo-panel]").forEach(syncDemoPanel);
};

document.querySelectorAll("[data-demo-panel]").forEach((panel) => {
  const options = Array.from(panel.querySelectorAll("[data-demo-option]"));
  const playButton = panel.querySelector("[data-demo-play]");

  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((item) => {
        const isActive = item === option;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      syncDemoPanel(panel);
    });

    option.setAttribute("aria-pressed", String(option.classList.contains("is-active")));
  });

  panel.querySelector("[data-demo-prev]")?.addEventListener("click", () => {
    const currentIndex = Math.max(0, options.findIndex((option) => option.classList.contains("is-active")));
    options[(currentIndex - 1 + options.length) % options.length]?.click();
  });

  panel.querySelector("[data-demo-next]")?.addEventListener("click", () => {
    const currentIndex = Math.max(0, options.findIndex((option) => option.classList.contains("is-active")));
    options[(currentIndex + 1) % options.length]?.click();
  });

  playButton?.addEventListener("click", () => {
    const isPlaying = playButton.classList.toggle("is-playing");
    playButton.textContent = isPlaying ? "Ⅱ" : "▶";
  });
});

const syncHeader = () => {
  if (!siteHeader) {
    return;
  }

  if (window.scrollY > 24) {
    siteHeader.classList.add("scrolled");
  } else {
    siteHeader.classList.remove("scrolled");
  }
};

const syncMenuState = () => {
  if (!menuToggle || !mainNav) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", String(mainNav.classList.contains("open")));
};

syncHeader();
syncMenuState();
setActiveNavigation();

window.addEventListener("scroll", syncHeader);

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
    syncMenuState();
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      syncMenuState();
    });
  });
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyTranslations(button.dataset.lang);
  });
});

const initialLanguage = getStoredLanguage() || detectBrowserLanguage();
applyTranslations(initialLanguage);
