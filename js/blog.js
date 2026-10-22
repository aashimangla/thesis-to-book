
document.addEventListener("DOMContentLoaded", () => {
  const posts = [...document.querySelectorAll(".blog-post")];
  const categoryButtons = [
    ...document.querySelectorAll(".blog-category-button")
  ];

  const searchForm = document.getElementById("blog-search-form");
  const searchInput = document.getElementById("blog-search-input");
  const status = document.getElementById("blog-status");
  const sectionTitle = document.getElementById("blog-section-title");
  const emptyState = document.getElementById("blog-empty");
  const resetButton = document.getElementById("blog-reset");
  const emptyReset = document.getElementById("blog-empty-reset");

  let activeCategory = "all";
  let searchQuery = "";

  const categoryNames = {
    all: "Latest Posts",
    thesis: "Thesis to Book",
    publishing: "Publishing Tips",
    writing: "Writing & Editing",
    design: "Design & Formatting",
    research: "Research Guidance",
    author: "Author Support",
    marketing: "Book Marketing",
    news: "News & Updates"
  };

  function renderPosts() {
    let visibleCount = 0;

    posts.forEach((post) => {
      const category = post.dataset.category;
      const searchableText = [
        post.dataset.title,
        post.dataset.category,
        post.textContent
      ].join(" ").toLowerCase();

      const matchesCategory =
        activeCategory === "all" || category === activeCategory;

      const matchesSearch =
        !searchQuery || searchableText.includes(searchQuery);

      const visible = matchesCategory && matchesSearch;

      post.hidden = !visible;

      if (visible) visibleCount++;
    });

    sectionTitle.textContent =
      categoryNames[activeCategory] || "Latest Posts";

    if (searchQuery) {
      status.textContent =
        `${visibleCount} article${visibleCount === 1 ? "" : "s"} found for "${searchQuery}".`;
    } else {
      status.textContent =
        `Showing ${visibleCount} article${visibleCount === 1 ? "" : "s"}.`;
    }

    emptyState.hidden = visibleCount !== 0;
  }

  function selectCategory(category) {
    activeCategory = category;

    categoryButtons.forEach((button) => {
      const selected = button.dataset.categoryFilter === category;

      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    renderPosts();
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectCategory(button.dataset.categoryFilter);
    });
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchQuery = searchInput.value.trim().toLowerCase();
    renderPosts();
  });

  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    renderPosts();
  });

  function resetFilters() {
    searchInput.value = "";
    searchQuery = "";
    selectCategory("all");
  }

  resetButton.addEventListener("click", resetFilters);
  emptyReset.addEventListener("click", resetFilters);

  // Newsletter UI demonstration.
  // Connect a backend or email marketing service before collecting subscriptions.
  const newsletterForm = document.getElementById("blog-newsletter-form");
  const newsletterStatus = document.getElementById("blog-newsletter-status");

  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    newsletterStatus.textContent =
      "The subscription form is ready. Email signup needs to be connected.";

    newsletterForm.reset();
  });

  renderPosts();
});
