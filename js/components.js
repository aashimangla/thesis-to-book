
/* ========================================
   THESISTOBOOK - SHARED COMPONENT LOADER
======================================== */

document.addEventListener("DOMContentLoaded", async () => {
  await loadComponent("site-header", "components/header.html");
  await loadComponent("site-footer", "components/footer.html");

  initializeHeader();
  initializeSearch();
});

async function loadComponent(targetId, filePath) {
  const target = document.getElementById(targetId);

  if (!target) return;

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Could not load ${filePath}: ${response.status}`);
    }

    target.innerHTML = await response.text();
  } catch (error) {
    console.error(error);

    target.innerHTML = `
      <div class="component-error">
        This component could not be loaded.
        Please run the website using VS Code Live Server.
      </div>
    `;
  }
}

/* Mobile navigation and active page */

function initializeHeader() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-navigation");

  if (!menuToggle || !navigation) return;

  menuToggle.addEventListener("click", () => {
    const isExpanded =
      menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute(
      "aria-label",
      isExpanded ? "Open navigation menu" : "Close navigation menu"
    );

    navigation.classList.toggle("is-open", !isExpanded);
  });

  // Close the mobile menu after a navigation link is selected.
  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
    });
  });

  // Highlight the current page in the navigation.
  const currentPage = window.location.pathname.split("/").pop()
    || "index.html";

  navigation.querySelectorAll("[data-page]").forEach((link) => {
    const isCurrent = link.dataset.page === currentPage;

    if (isCurrent) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });
}

/* Search interface */

function initializeSearch() {
  const searchToggle = document.querySelector(".search-toggle");
  const searchForm = document.querySelector(".site-search");
  const searchInput = document.getElementById("site-search-input");
  const searchMessage = document.querySelector(".search-message");

  if (!searchToggle || !searchForm || !searchInput) return;

  searchToggle.addEventListener("click", () => {
    const willOpen = searchForm.hidden;

    searchForm.hidden = !willOpen;
    searchToggle.setAttribute("aria-expanded", String(willOpen));

    if (willOpen) {
      searchInput.focus();
    }
  });

  // Simple page search. Extend this list as new pages are created.
  const searchablePages = [
    {
      title: "Home",
      url: "index.html",
      keywords: "home welcome thesis book"
    },
    {
      title: "Thesis to Book",
      url: "thesis-to-book.html",
      keywords: "thesis dissertation conversion research"
    },
    {
      title: "Our Packages",
      url: "packages.html",
      keywords: "pricing basic standard premium packages"
    },
    {
      title: "How It Works",
      url: "how-it-works.html",
      keywords: "process steps timeline"
    },
    {
      title: "Our Book Gallery",
      url: "gallery.html",
      keywords: "gallery samples covers designs"
    },
    {
      title: "About Us",
      url: "about.html",
      keywords: "about team mission company"
    },
    {
      title: "Our Advisors",
      url: "advisors.html",
      keywords: "advisors experts academics"
    },
    {
      title: "Blog",
      url: "blog.html",
      keywords: "articles resources publishing"
    },
    {
      title: "Contact Us",
      url: "contact.html",
      keywords: "contact support email inquiry"
    },
    {
      title: "Submit Your Thesis",
      url: "submit-thesis.html",
      keywords: "submit upload consultation get started"
    }
  ];

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      searchMessage.textContent = "Please enter a search term.";
      searchInput.focus();
      return;
    }

    const matches = searchablePages.filter((page) => {
      const searchableText =
        `${page.title} ${page.keywords}`.toLowerCase();

      return searchableText.includes(query);
    });

    if (matches.length === 1) {
      window.location.href = matches[0].url;
      return;
    }

    if (matches.length > 1) {
      searchMessage.textContent =
        "Matching pages: " + matches.map((page) => page.title).join(", ");
      return;
    }

    searchMessage.textContent =
      "No matching pages found. Try searching for thesis, packages, gallery or contact.";
  });
}
