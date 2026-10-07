"use strict";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.getElementById("navigation");
const mobileScreen = window.matchMedia("(max-width: 1000px)");

function setMenuOpen(isOpen) {
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.textContent = isOpen ? "Close" : "Menu";

  // Desktop navigation always stays visible.
  navigation.hidden = mobileScreen.matches && !isOpen;
}

function updateNavigation() {
  const focusWasInNavigation = navigation.contains(document.activeElement);
  const focusWasOnButton = document.activeElement === menuButton;

  menuButton.hidden = !mobileScreen.matches;
  setMenuOpen(false);

  // Keep keyboard focus on a visible control after resizing.
  if (mobileScreen.matches && focusWasInNavigation) {
    menuButton.focus();
  } else if (!mobileScreen.matches && focusWasOnButton) {
    navigation.querySelector("a").focus();
  }
}

navigation.dataset.enhanced = "";
updateNavigation();

// Open or close mobile navigation.
menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

// Close navigation after selecting a section.
navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!link || !mobileScreen.matches) return;

  setMenuOpen(false);

  // Move keyboard focus to the chosen section.
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

// Close when clicking outside the menu.
document.addEventListener("click", (event) => {
  if (
    menuButton.getAttribute("aria-expanded") === "true" &&
    !navigation.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    setMenuOpen(false);
  }
});

// Escape closes the menu and returns focus to its button.
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    setMenuOpen(false);
    menuButton.focus();
  }
});

// Only runs when crossing the navigation breakpoint.
mobileScreen.addEventListener("change", updateNavigation);

// Keep the footer year current.
document.getElementById("year").textContent = new Date().getFullYear();