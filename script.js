"use strict";

/* MOBILE NAVIGATION */

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.getElementById("navigation");
const mobileScreen = window.matchMedia("(max-width: 1000px)");

function setMenuOpen(isOpen) {
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.textContent = isOpen ? "Close" : "Menu";
  navigation.hidden = mobileScreen.matches && !isOpen;
}

function updateNavigation() {
  const focusWasInNavigation = navigation.contains(document.activeElement);
  const focusWasOnButton = document.activeElement === menuButton;

  menuButton.hidden = !mobileScreen.matches;
  setMenuOpen(false);

  if (mobileScreen.matches && focusWasInNavigation) {
    menuButton.focus();
  } else if (!mobileScreen.matches && focusWasOnButton) {
    navigation.querySelector("a").focus();
  }
}

navigation.dataset.enhanced = "";
updateNavigation();

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!link || !mobileScreen.matches) return;

  setMenuOpen(false);

  const section = document.querySelector(link.hash);

  if (section) {
    section.setAttribute("tabindex", "-1");
    section.focus({ preventScroll: true });

    section.addEventListener(
      "blur",
      () => section.removeAttribute("tabindex"),
      { once: true }
    );
  }
});

document.addEventListener("click", (event) => {
  if (
    menuButton.getAttribute("aria-expanded") === "true" &&
    !navigation.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    setMenuOpen(false);
    menuButton.focus();
  }
});

mobileScreen.addEventListener("change", updateNavigation);

/* FOOTER YEAR */

document.getElementById("year").textContent = new Date().getFullYear();

/* FADE-IN EFFECT */

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealElements = document.querySelectorAll(
    [
      ".hero > div",
      ".terminal",
      ".perspective-card",
      ".section-heading",
      ".project-card",
      ".about-grid > div",
      ".skill-card",
      ".contact-card"
    ].join(",")
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.remove("reveal-pending");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealElements.forEach((element) => {
    const bounds = element.getBoundingClientRect();

    if (bounds.top < window.innerHeight) return;

    element.classList.add("scroll-reveal", "reveal-pending");
    revealObserver.observe(element);
  });

  reducedMotion.addEventListener("change", (event) => {
    if (!event.matches) return;

    revealObserver.disconnect();

    revealElements.forEach((element) => {
      element.classList.remove("reveal-pending");
    });
  });
}

/* SCREENSHOT GALLERIES */

document.querySelectorAll(".project-gallery").forEach((gallery) => {
  const figures = [...gallery.querySelectorAll(".screenshot")];

  if (figures.length < 2) return;

  let activeIndex = 0;

  const header = document.createElement("div");
  header.className = "gallery-header";

  const heading = document.createElement("p");
  heading.textContent = "Project screenshots";

  const controls = document.createElement("div");
  controls.className = "gallery-controls";

  const previous = document.createElement("button");
  previous.type = "button";
  previous.className = "gallery-arrow";
  previous.textContent = "←";
  previous.setAttribute("aria-label", "Previous screenshot");

  const next = document.createElement("button");
  next.type = "button";
  next.className = "gallery-arrow";
  next.textContent = "→";
  next.setAttribute("aria-label", "Next screenshot");

  const count = document.createElement("span");
  count.className = "gallery-count";
  count.setAttribute("aria-live", "polite");
  count.setAttribute("aria-atomic", "true");

  controls.append(previous, count, next);
  header.append(heading, controls);

  const thumbnails = document.createElement("div");
  thumbnails.className = "gallery-thumbnails";

  const buttons = figures.map((figure, index) => {
    const image = figure.querySelector("img");
    const title = figure
      .querySelector("figcaption strong")
      ?.textContent.trim();

    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-thumbnail";
    button.setAttribute(
      "aria-label",
      `Show screenshot ${index + 1}: ${title || image.alt}`
    );

    const thumbnail = document.createElement("img");
    thumbnail.src = image.getAttribute("src");
    thumbnail.alt = "";
    thumbnail.loading = "lazy";
    thumbnail.decoding = "async";
    thumbnail.width = 76;
    thumbnail.height = 54;

    button.append(thumbnail);
    button.addEventListener("click", () => selectImage(index));

    thumbnails.append(button);

    return button;
  });

  function selectImage(index) {
    activeIndex = (index + figures.length) % figures.length;

    figures.forEach((figure, position) => {
      const isSelected = position === activeIndex;

      figure.hidden = !isSelected;
      buttons[position].setAttribute(
        "aria-pressed",
        String(isSelected)
      );
    });

    count.textContent = `${activeIndex + 1} / ${figures.length}`;
  }

  previous.addEventListener("click", () => {
    selectImage(activeIndex - 1);
  });

  next.addEventListener("click", () => {
    selectImage(activeIndex + 1);
  });

  gallery.prepend(header);
  gallery.append(thumbnails);

  selectImage(0);
});

/* ENLARGED IMAGE VIEWER */

const imageViewer = document.getElementById("image-viewer");
const imageViewerImage = document.getElementById("image-viewer-img");

if (imageViewer && typeof imageViewer.showModal === "function") {
  const previous = document.getElementById("viewer-prev");
  const next = document.getElementById("viewer-next");
  const count = document.getElementById("viewer-count");

  let images = [];
  let activeIndex = 0;

  function showImage(index) {
    activeIndex = (index + images.length) % images.length;

    const link = images[activeIndex];

    imageViewerImage.src = link.href;
    imageViewerImage.alt = link.querySelector("img").alt;

    count.textContent = `${activeIndex + 1} / ${images.length}`;
    previous.hidden = next.hidden = images.length < 2;
  }

  document
    .querySelectorAll(".screenshot > a, .featured-preview")
    .forEach((link) => {
      link.setAttribute("aria-haspopup", "dialog");
      link.removeAttribute("target");

      link.addEventListener("click", (event) => {
        if (
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();

        const gallery = link
          .closest(".project-card")
          ?.querySelector(".project-gallery");

        images = gallery
          ? [...gallery.querySelectorAll(".screenshot > a")]
          : [link];

        const index = images.findIndex(
          (image) => image.href === link.href
        );

        showImage(Math.max(0, index));

        imageViewer.showModal();
        document.documentElement.classList.add("image-viewer-open");
      });
    });

  previous.addEventListener("click", () => {
    showImage(activeIndex - 1);
  });

  next.addEventListener("click", () => {
    showImage(activeIndex + 1);
  });

  imageViewer
    .querySelector(".image-viewer-close")
    .addEventListener("click", () => imageViewer.close());

  imageViewer.addEventListener("click", (event) => {
    if (event.target === imageViewer) {
      imageViewer.close();
    }
  });

  imageViewer.addEventListener("keydown", (event) => {
    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight"
    ) {
      event.preventDefault();

      showImage(
        activeIndex + (event.key === "ArrowLeft" ? -1 : 1)
      );
    }
  });

  imageViewer.addEventListener("close", () => {
    document.documentElement.classList.remove("image-viewer-open");

    imageViewerImage.removeAttribute("src");
    imageViewerImage.alt = "";
    count.textContent = "";
    images = [];
  });
}
